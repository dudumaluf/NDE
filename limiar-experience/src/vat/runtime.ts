import * as THREE from "three/webgpu";
import { BASIS_NAMES, VAT, VAT_FPS, type BasisName } from "./descriptor";
import { qpStr } from "../lib/urlParams";

/**
 * Descriptor ATIVO da VAT em runtime.
 *
 * Default: o asset legado do patch (EXRs do Houdini, basis x_negz_y —
 * `descriptor.ts`). Com `?vat=<nome>` na URL, carrega um descriptor gerado
 * pelo `tools/vat-bake.mjs` de `public/vat/<nome>/vat.json` (.bin float16,
 * basis identity, pés no y=0) — personagens/clipes novos sem tocar no código.
 */

export interface VatClipInfo {
  name: string;
  loop: boolean;
}

export interface ActiveVat {
  name: string;
  /** Colunas da textura = vértices endereçáveis por vertexIndex. */
  vertexCount: number;
  textureWidth: number;
  textureHeight: number;
  clipCount: number;
  framesPerClip: number;
  /** Frames por segundo de playback (legado: ~18). */
  fps: number;
  /** Duração de um clipe em segundos (framesPerClip / fps). */
  clipSeconds: number;
  clips: readonly VatClipInfo[];
  basis: BasisName;
  bakeOffset: readonly [number, number, number];
  positionsUrl: string;
  normalsUrl: string;
  /** "exr" = legado (float32); "bin-f16" = saída do vat-bake. */
  encoding: "exr" | "bin-f16";
  /** Topologia indexed do vat-bake (malhas grandes); null = soup pura. */
  indices: Uint32Array | null;
}

/** Formato do vat.json escrito por tools/vat-bake.mjs (format "vat-bake/1"). */
interface VatBakeDescriptor {
  format: string;
  topology: "soup" | "indexed";
  vertexCount: number;
  textureWidth: number;
  textureHeight: number;
  clipCount: number;
  framesPerClip: number;
  fps: number;
  basis: string;
  bakeOffset: [number, number, number];
  clips: { name: string; mode: "loop" | "oneshot" }[];
  files: { positions: string; normals: string; indices?: string };
}

const legacy: ActiveVat = {
  name: "legado",
  vertexCount: VAT.vertexCount,
  textureWidth: VAT.textureWidth,
  textureHeight: VAT.textureHeight,
  clipCount: VAT.clipCount,
  framesPerClip: VAT.framesPerClip,
  fps: VAT_FPS,
  clipSeconds: VAT.clipSeconds,
  clips: VAT.clips,
  basis: "x_negz_y",
  bakeOffset: VAT.bakeOffset,
  positionsUrl: VAT.positionsUrl,
  normalsUrl: VAT.normalsUrl,
  encoding: "exr",
  indices: null,
};

let active: ActiveVat = legacy;

/** O descriptor ativo. Definido UMA vez (initVat) antes do primeiro render. */
export function vat(): ActiveVat {
  return active;
}

/**
 * Lê `?vat=<nome>` e, se presente, troca o descriptor ativo pelo custom.
 * Qualquer falha mantém o legado — o app nunca quebra por asset ruim.
 * Deve rodar ANTES do render (main.tsx): shaders/sim capturam vat() ao montar.
 */
export async function initVat(): Promise<void> {
  const name = qpStr("vat", "");
  if (!name) return;
  if (!/^[\w-]+$/.test(name)) {
    console.warn(`[vat] nome inválido em ?vat=${name} — usando o legado`);
    return;
  }
  const base = `/vat/${name}`;
  try {
    const res = await fetch(`${base}/vat.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${base}/vat.json`);
    const desc = (await res.json()) as VatBakeDescriptor;
    if (!desc.format?.startsWith("vat-bake/"))
      throw new Error(`format desconhecido: ${desc.format}`);
    if (!(BASIS_NAMES as readonly string[]).includes(desc.basis))
      throw new Error(`basis desconhecida: ${desc.basis}`);

    let indices: Uint32Array | null = null;
    if (desc.topology === "indexed") {
      if (!desc.files.indices) throw new Error("topologia indexed sem files.indices");
      const buf = await fetch(`${base}/${desc.files.indices}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} nos índices`);
        return r.arrayBuffer();
      });
      indices = new Uint32Array(buf);
    }

    active = {
      name,
      vertexCount: desc.vertexCount,
      textureWidth: desc.textureWidth,
      textureHeight: desc.textureHeight,
      clipCount: desc.clipCount,
      framesPerClip: desc.framesPerClip,
      fps: desc.fps,
      clipSeconds: desc.framesPerClip / desc.fps,
      clips: desc.clips.map((c) => ({ name: c.name, loop: c.mode === "loop" })),
      basis: desc.basis as BasisName,
      bakeOffset: desc.bakeOffset,
      positionsUrl: `${base}/${desc.files.positions}`,
      normalsUrl: `${base}/${desc.files.normals}`,
      encoding: "bin-f16",
      indices,
    };
    console.info(
      `[vat] descriptor custom "${name}": ${desc.textureWidth}×${desc.textureHeight}, ` +
        `${desc.clipCount} clipes (${desc.clips.map((c) => c.name).join(", ")}), ${desc.topology}`,
    );
  } catch (e) {
    console.warn(`[vat] falha ao carregar ?vat=${name} — usando o legado.`, e);
  }
}

const HALF_ONE = 0x3c00; // 1.0 em float16

/** .bin do vat-bake (RGB float16 raw) → DataTexture RGBA half float. */
export function binToTexture(buf: ArrayBuffer): THREE.DataTexture {
  const { textureWidth: w, textureHeight: h } = active;
  const rgb = new Uint16Array(buf);
  if (rgb.length !== w * h * 3)
    throw new Error(`bin com ${rgb.length} valores ≠ ${w}×${h}×3 do descriptor`);
  const rgba = new Uint16Array(w * h * 4);
  for (let i = 0, j = 0, k = 0; i < w * h; i++) {
    rgba[k++] = rgb[j++];
    rgba[k++] = rgb[j++];
    rgba[k++] = rgb[j++];
    rgba[k++] = HALF_ONE;
  }
  const tex = new THREE.DataTexture(rgba, w, h, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.needsUpdate = true;
  return tex;
}

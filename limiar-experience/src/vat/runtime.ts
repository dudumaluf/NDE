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
 *
 * Com `?vatB=<nome>` (requer `?vat=`), uma SEGUNDA VAT da MESMA malha é
 * carregada para morph entre texturas: as linhas de B são empilhadas abaixo
 * das de A numa textura combinada (mesma largura = mesma contagem de
 * vértices, validada aqui), e os clipes de B viram índices globais
 * contínuos (clipCount de A em diante). O shader não muda: o crossfade A/B
 * já endereça qualquer linha da textura — inclusive as de B.
 */

/** Papel funcional declarado no bake (Studio/vat.json) — ver clipRoles.ts. */
export type DeclaredClipRole = "idle" | "walk" | "run" | "pray";

export interface VatClipInfo {
  name: string;
  loop: boolean;
  /** Papel declarado no descriptor (vence a detecção por nome). */
  role?: DeclaredClipRole | null;
}

/** Trajetória da raiz removida pelo "andar no lugar" (tools/vat-bake). */
export interface VatRootMotion {
  clip: string;
  /** 1 amostra [x,y,z] por frame do clipe, na escala do bake. */
  samples: [number, number, number][];
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
  /** Identidade da malha (vat-bake/2) — VATs com o mesmo hash podem cruzar morph. */
  meshHash: string | null;
  /** Root motion exportado por clipe in-place (vazio se nenhum). */
  rootMotion: VatRootMotion[];
  /** Normalização do bake: pos = (raw + translate) × scale (re-normalização A/B). */
  normScale: number;
  normTranslate: readonly [number, number, number];
}

/** VAT secundária (?vatB=) — mesma malha, clipes anexados após os de A. */
export interface SecondaryVat {
  name: string;
  /** Índice global do 1º clipe de B (= clipCount de A). */
  clipOffset: number;
  clipCount: number;
  clips: readonly VatClipInfo[];
  fps: number;
  /** Linhas próprias de B (empilhadas abaixo das de A na textura combinada). */
  textureHeight: number;
  positionsUrl: string;
  normalsUrl: string;
  meshHash: string | null;
  rootMotion: VatRootMotion[];
  normScale: number;
  normTranslate: readonly [number, number, number];
}

/** Formato do vat.json escrito por tools/vat-bake.mjs (format "vat-bake/*"). */
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
  meshHash?: string;
  clips: { name: string; mode: "loop" | "oneshot"; role?: string }[];
  files: { positions: string; normals: string; indices?: string };
  normalization?: { scale: number; translate: [number, number, number] };
  rootMotion?: VatRootMotion[];
}

const CLIP_ROLES: readonly DeclaredClipRole[] = ["idle", "walk", "run", "pray"];

function parseRole(v: string | undefined): DeclaredClipRole | null {
  return CLIP_ROLES.includes(v as DeclaredClipRole)
    ? (v as DeclaredClipRole)
    : null;
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
  meshHash: null,
  rootMotion: [],
  normScale: 1,
  normTranslate: [0, 0, 0],
};

let active: ActiveVat = legacy;
let secondary: SecondaryVat | null = null;

/** O descriptor ativo. Definido UMA vez (initVat) antes do primeiro render. */
export function vat(): ActiveVat {
  return active;
}

/** A VAT secundária (?vatB=), ou null. Também fixada antes do primeiro render. */
export function vatB(): SecondaryVat | null {
  return secondary;
}

// ---------------------------------------------------------------------------
// Visão combinada dos clipes (A ++ B) — o player e a UI endereçam clipes por
// ÍNDICE GLOBAL: [0, A.clipCount) são de A, [A.clipCount, total) são de B.

export interface GlobalClipInfo extends VatClipInfo {
  /** Nome da VAT dona do clipe (para rótulos de UI). */
  vatName: string;
  /** fps de playback da VAT dona (A e B podem diferir). */
  fps: number;
  /** Root motion exportado para este clipe (null se não houver). */
  rootMotion: VatRootMotion | null;
}

export function totalClipCount(): number {
  return active.clipCount + (secondary?.clipCount ?? 0);
}

export function clipInfo(index: number): GlobalClipInfo | null {
  if (index < 0) return null;
  if (index < active.clipCount) {
    const c = active.clips[index];
    return {
      ...c,
      vatName: active.name,
      fps: active.fps,
      rootMotion: active.rootMotion.find((r) => r.clip === c.name) ?? null,
    };
  }
  if (!secondary) return null;
  const local = index - secondary.clipOffset;
  const c = secondary.clips[local];
  if (!c) return null;
  return {
    ...c,
    vatName: secondary.name,
    fps: secondary.fps,
    rootMotion: secondary.rootMotion.find((r) => r.clip === c.name) ?? null,
  };
}

/**
 * Índice global de um clipe local de uma VAT nomeada — a forma que o
 * VatClipPlayer usa para `play(clip, { vat: "nome" })`. Retorna −1 se a VAT
 * não está carregada ou o índice não existe nela.
 */
export function globalClipIndex(local: number, vatName?: string): number {
  if (!vatName || vatName === active.name)
    return local >= 0 && local < active.clipCount ? local : -1;
  if (secondary && vatName === secondary.name)
    return local >= 0 && local < secondary.clipCount ? secondary.clipOffset + local : -1;
  return -1;
}

// ---------------------------------------------------------------------------
// Carga dos descriptors

async function fetchDescriptor(name: string): Promise<VatBakeDescriptor> {
  const res = await fetch(`/vat/${name}/vat.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status} em /vat/${name}/vat.json`);
  const desc = (await res.json()) as VatBakeDescriptor;
  if (!desc.format?.startsWith("vat-bake/"))
    throw new Error(`format desconhecido: ${desc.format}`);
  if (!(BASIS_NAMES as readonly string[]).includes(desc.basis))
    throw new Error(`basis desconhecida: ${desc.basis}`);
  return desc;
}

const validName = (name: string): boolean => /^[\w-]+$/.test(name);

/**
 * Lê `?vat=<nome>` (e `?vatB=<nome>`) e troca o(s) descriptor(s) ativo(s).
 * Qualquer falha mantém o que estava — o app nunca quebra por asset ruim.
 * Deve rodar ANTES do render (main.tsx): shaders/sim capturam vat() ao montar.
 */
export async function initVat(): Promise<void> {
  const name = qpStr("vat", "");
  if (name) {
    if (!validName(name)) {
      console.warn(`[vat] nome inválido em ?vat=${name} — usando o legado`);
    } else {
      try {
        const desc = await fetchDescriptor(name);
        let indices: Uint32Array | null = null;
        if (desc.topology === "indexed") {
          if (!desc.files.indices) throw new Error("topologia indexed sem files.indices");
          const buf = await fetch(`/vat/${name}/${desc.files.indices}`).then((r) => {
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
          clips: desc.clips.map((c) => ({
            name: c.name,
            loop: c.mode === "loop",
            role: parseRole(c.role),
          })),
          basis: desc.basis as BasisName,
          bakeOffset: desc.bakeOffset,
          positionsUrl: `/vat/${name}/${desc.files.positions}`,
          normalsUrl: `/vat/${name}/${desc.files.normals}`,
          encoding: "bin-f16",
          indices,
          meshHash: desc.meshHash ?? null,
          rootMotion: desc.rootMotion ?? [],
          normScale: desc.normalization?.scale ?? 1,
          normTranslate: desc.normalization?.translate ?? [0, 0, 0],
        };
        console.info(
          `[vat] descriptor custom "${name}": ${desc.textureWidth}×${desc.textureHeight}, ` +
            `${desc.clipCount} clipes (${desc.clips.map((c) => c.name).join(", ")}), ${desc.topology}` +
            (desc.meshHash ? `, meshHash ${desc.meshHash}` : ""),
        );
      } catch (e) {
        console.warn(`[vat] falha ao carregar ?vat=${name} — usando o legado.`, e);
      }
    }
  }
  await initVatB();
}

/**
 * VAT secundária para morph entre texturas. Regras de compatibilidade
 * (recusa com mensagem clara — o app segue só com a A):
 * - requer `?vat=` custom (o legado EXR não é combinável com bins f16);
 * - contagem de vértices IGUAL (colunas = os mesmos vértices por índice);
 * - mesmo framesPerClip (o endereçamento de linha assume grade única);
 * - mesma topologia (indexed/soup — o index buffer vem de A).
 * meshHash diferente (com contagens iguais) e escala de bake divergente
 * geram AVISO: o morph roda, mas só faz sentido geométrico na mesma malha.
 */
async function initVatB(): Promise<void> {
  secondary = null;
  const name = qpStr("vatB", "");
  if (!name) return;
  const refuse = (why: string) =>
    console.warn(`[vat] ?vatB=${name} recusada: ${why} — morph entre texturas indisponível.`);
  if (!validName(name)) return refuse("nome inválido");
  if (active.encoding !== "bin-f16")
    return refuse(
      "a VAT ativa é o asset legado (EXR); o morph entre texturas requer duas VATs do vat-bake (?vat=a&vatB=b)",
    );
  if (name === active.name) return refuse("é a mesma VAT ativa (?vat=)");
  try {
    const desc = await fetchDescriptor(name);
    if (desc.vertexCount !== active.vertexCount)
      return refuse(
        `contagem de vértices difere (${desc.vertexCount} ≠ ${active.vertexCount}) — ` +
          `morph exige a MESMA malha (mesmo personagem e mesma redução no bake)`,
      );
    if (desc.framesPerClip !== active.framesPerClip)
      return refuse(
        `framesPerClip difere (${desc.framesPerClip} ≠ ${active.framesPerClip}) — asse as duas com o mesmo valor`,
      );
    const topoA = active.indices ? "indexed" : "soup";
    if (desc.topology !== topoA)
      return refuse(`topologia difere (${desc.topology} ≠ ${topoA})`);
    if (desc.basis !== active.basis) return refuse(`basis difere (${desc.basis} ≠ ${active.basis})`);
    if (active.meshHash && desc.meshHash && desc.meshHash !== active.meshHash)
      console.warn(
        `[vat] aviso: meshHash difere entre "${active.name}" (${active.meshHash}) e "${name}" ` +
          `(${desc.meshHash}) — mesma contagem de vértices, mas malhas provavelmente diferentes; ` +
          `o morph vai renderizar, mas pode não fazer sentido geométrico.`,
      );
    secondary = {
      name,
      clipOffset: active.clipCount,
      clipCount: desc.clipCount,
      clips: desc.clips.map((c) => ({
        name: c.name,
        loop: c.mode === "loop",
        role: parseRole(c.role),
      })),
      fps: desc.fps,
      textureHeight: desc.textureHeight,
      positionsUrl: `/vat/${name}/${desc.files.positions}`,
      normalsUrl: `/vat/${name}/${desc.files.normals}`,
      meshHash: desc.meshHash ?? null,
      rootMotion: desc.rootMotion ?? [],
      normScale: desc.normalization?.scale ?? 1,
      normTranslate: desc.normalization?.translate ?? [0, 0, 0],
    };
    console.info(
      `[vat] VAT B "${name}": ${desc.clipCount} clipes (${desc.clips.map((c) => c.name).join(", ")}) ` +
        `anexados após os ${active.clipCount} de "${active.name}" — morph entre texturas ativo.`,
    );
  } catch (e) {
    refuse(`falha ao carregar (${e instanceof Error ? e.message : e})`);
  }
}

// ---------------------------------------------------------------------------
// Texturas

const HALF_ONE = 0x3c00; // 1.0 em float16

/**
 * .bin do vat-bake (RGB float16 raw) → DataTexture RGBA half float.
 * Com a VAT B ativa, recebe os bins dela também e devolve a textura
 * COMBINADA: linhas de A em cima, linhas de B logo abaixo — larguras iguais
 * por validação. O sampler não distingue: clipe global × framesPerClip cai
 * na linha certa de qualquer uma das duas.
 *
 * `kind: "positions"` re-normaliza as posições de B para o espaço de A
 * quando os bakes normalizaram diferente (a altura é medida no frame 0 do
 * 1º clipe — Idle vs Run dão escalas ~5% diferentes): sem isso o personagem
 * mudaria de tamanho/centro durante o morph. pos_A = pos_B×(sA/sB) +
 * (tA−tB)×sA por componente. Normais não mudam (escala uniforme).
 */
export function binToTexture(
  buf: ArrayBuffer,
  bufB?: ArrayBuffer | null,
  kind: "positions" | "normals" = "positions",
): THREE.DataTexture {
  const { textureWidth: w, textureHeight: hA } = active;
  const hB = bufB && secondary ? secondary.textureHeight : 0;
  const h = hA + hB;
  const rgba = new Uint16Array(w * h * 4);

  const fill = (
    src: ArrayBuffer,
    rowOffset: number,
    rows: number,
    label: string,
    remap?: { s: number; t: [number, number, number] },
  ) => {
    const rgb = new Uint16Array(src);
    if (rgb.length !== w * rows * 3)
      throw new Error(`bin ${label} com ${rgb.length} valores ≠ ${w}×${rows}×3 do descriptor`);
    const { fromHalfFloat, toHalfFloat } = THREE.DataUtils;
    let j = 0;
    let k = rowOffset * w * 4;
    for (let i = 0; i < w * rows; i++) {
      if (remap) {
        rgba[k++] = toHalfFloat(fromHalfFloat(rgb[j++]) * remap.s + remap.t[0]);
        rgba[k++] = toHalfFloat(fromHalfFloat(rgb[j++]) * remap.s + remap.t[1]);
        rgba[k++] = toHalfFloat(fromHalfFloat(rgb[j++]) * remap.s + remap.t[2]);
      } else {
        rgba[k++] = rgb[j++];
        rgba[k++] = rgb[j++];
        rgba[k++] = rgb[j++];
      }
      rgba[k++] = HALF_ONE;
    }
  };

  fill(buf, 0, hA, `de "${active.name}"`);
  if (bufB && hB && secondary) {
    let remap: { s: number; t: [number, number, number] } | undefined;
    if (kind === "positions") {
      const s = active.normScale / secondary.normScale;
      const t = active.normTranslate.map(
        (ta, c) => (ta - secondary!.normTranslate[c]) * active.normScale,
      ) as [number, number, number];
      const identity = Math.abs(s - 1) < 1e-6 && t.every((v) => Math.abs(v) < 1e-6);
      remap = identity ? undefined : { s, t };
    }
    fill(bufB, hA, hB, `de "${secondary.name}"`, remap);
  }

  const tex = new THREE.DataTexture(rgba, w, h, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.needsUpdate = true;
  return tex;
}

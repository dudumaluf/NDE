import * as THREE from "three/webgpu";

/**
 * Descriptor da VAT (Vertex Animation Texture) herdada do patch cables.
 * Fonte da verdade: Docs/ANALISE_TECNICA.md §3 e §6.
 *
 * Layout "Lines": cada linha da textura = 1 frame; cada coluna = 1 vértice.
 * A textura de 1590×360 contém 6 clipes de 60 frames empilhados verticalmente.
 */
export const VAT = {
  positionsUrl: "/vat/anim_positions_360f.exr",
  normalsUrl: "/vat/anim_normals_360f.exr",
  vertexCount: 1590,
  textureWidth: 1590,
  textureHeight: 360,
  clipCount: 6,
  framesPerClip: 60,
  /**
   * Rótulos por clipe — IDENTIFICADOS visualmente no M0 (screenshots em shots/).
   * Mapeiam 1:1 para a máquina de estados narrativa do doc 01 §4.
   */
  clipLabels: [
    "idle (em pé, respirando)",
    "andar (walk cycle — default do patch)",
    "idle 2 (em pé, braços soltos)",
    "queda/morte (one-shot, termina deitado)",
    "levantar (one-shot, do chão até mãos juntas)",
    "rezar (loop, mãos juntas, cabeça baixa)",
  ],
  /**
   * Offset de recentralização em espaço de bake (subtraído antes da basis).
   * Medido dos EXRs (scripts/inspect-exr.mjs): centro X/Y dos clipes em pé
   * (0,1,2,5) e máximo do canal Z (vertical invertido) para aterrar os pés.
   * (O patch usava 0.37,0.40,0.37 + escala própria — irrelevante aqui.)
   */
  bakeOffset: [0.7185, 0.7355, 0.7378] as const,
  /** Duração default de um clipe (timer 0.3 do patch → ~3.33 s por loop de 60 f). */
  clipSeconds: 3.33,
} as const;

export const BASIS_NAMES = [
  "x_negz_y",
  "identity",
  "flipZ",
  "flipY",
  "xzy",
  "x_z_negy",
] as const;

export type BasisName = (typeof BASIS_NAMES)[number];

/**
 * Candidatos de conversão de espaço (bake → mundo Y-up).
 * O patch fazia: RgbTransform rot X 90° (compose) e depois swizzle `.xzy` (shader).
 * CONFIRMADO empiricamente no M0: a base correta é "x_negz_y" — (x, −z, y),
 * i.e. o dado cru do EXR é Z-up (Houdini) e vira Y-up com y=−z, z=y.
 */
export function basisMatrix(name: BasisName): THREE.Matrix3 {
  const m = new THREE.Matrix3();
  switch (name) {
    case "identity":
      m.identity();
      break;
    case "flipZ":
      m.set(1, 0, 0, 0, 1, 0, 0, 0, -1);
      break;
    case "flipY":
      m.set(1, 0, 0, 0, -1, 0, 0, 0, 1);
      break;
    case "xzy": // (x, z, y)
      m.set(1, 0, 0, 0, 0, 1, 0, 1, 0);
      break;
    case "x_negz_y": // (x, −z, y)
      m.set(1, 0, 0, 0, 0, -1, 0, 1, 0);
      break;
    case "x_z_negy": // (x, z, −y)
      m.set(1, 0, 0, 0, 0, 1, 0, -1, 0);
      break;
  }
  return m;
}

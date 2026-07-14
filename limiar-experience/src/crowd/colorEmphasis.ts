import type { CrowdAttributes } from "../vat/vatGeometry";
import type { Content } from "../data/types";
import type { DemoClassification } from "../data/demoLens";
import type { ActiveLegendFlash } from "../ui/legendStore";
import { desaturate } from "../data/palette";

/**
 * Coesão visual (M3.5): re-escrita do MESMO iColorScale que já existe
 * (46 escritas por mudança, nenhum uniform/shader novo).
 *
 * Duas vias:
 *  - lente de elemento ativa → quem não tem o elemento fica ~35% mais cinza
 *    e um tico mais escuro (segue legível, mas recua);
 *  - "flash" da legenda (clique num chip) → contraste MÁXIMO (pedido do
 *    Dudu, 2026-07-12): selecionados mantêm a cor PLENA, todos os demais
 *    COLAPSAM para um cinza uniforme — mesmo tom para todo mundo, não só
 *    dessaturado. `flashK` (envelope calculado no CrowdMesh: 1 no hold,
 *    smootherstep→0 no fade) anima a volta; `flashIntensity` é o slider
 *    "destaque: intensidade" (1 = colapso total no cinza).
 *
 * Rodar SEMPRE depois de fillContentAttributes + ajuste HSB (lê a cor base
 * já escrita — o cinza do colapso fica uniforme mesmo com HSB mexido).
 */

/** O cinza uniforme do colapso: tom único, um degrau acima dos dormentes. */
const FLASH_GRAY: [number, number, number] = [0.40, 0.395, 0.385];

export interface EmphasisOpts {
  /** Key do elemento da lente ativa (null = sem lente de elemento). */
  elementLens: string | null;
  /** Destaque temporário disparado pela legenda. */
  flash: ActiveLegendFlash | null;
  /** Envelope do flash agora (1 = pleno, 0 = apagado). Default 1. */
  flashK?: number;
  /** Slider "destaque: intensidade" (0..1). Default 1. */
  flashIntensity?: number;
  /** Cinza do colapso (grupo Appearance). Default = FLASH_GRAY clássico. */
  mutedGray?: [number, number, number];
}

export function applyColorEmphasis(
  attrs: CrowdAttributes,
  count: number,
  content: Content,
  demoCls: DemoClassification | null,
  { elementLens, flash, flashK = 1, flashIntensity = 1, mutedGray }: EmphasisOpts,
): void {
  const flashOn = flash !== null && flashK > 0 && flashIntensity > 0;
  if (!elementLens && !flashOn) return;

  const gray = mutedGray ?? FLASH_GRAY;
  const people = content.manifest.people;
  const n = Math.min(people.length, count);
  const arr = attrs.colorScale.array as Float32Array;
  const collapse = flashOn ? flashK * flashIntensity : 0;

  for (let i = 0; i < n; i++) {
    const p = people[i];

    let inFlash = true;
    if (flash) {
      if (flash.kind === "cluster") {
        inFlash = p.cluster_id === Number(flash.id);
      } else if (flash.kind === "demo") {
        inFlash = demoCls !== null && demoCls.personCat[i] === Number(flash.id);
      } else {
        // "side": os dois lados da lente de elemento (tem / não tem)
        inFlash =
          elementLens !== null &&
          (flash.id === "has") === p.elements.includes(elementLens);
      }
    }
    const inLens = elementLens ? p.elements.includes(elementLens) : true;

    const o = i * 4;
    const base: [number, number, number] = [arr[o], arr[o + 1], arr[o + 2]];

    // Camada 1 — lente: recuo suave de quem não pertence.
    const lensC = inLens ? base : desaturate(base, 0.35, 0.92);

    // Camada 2 — flash: cor plena vs cinza uniforme, cruzadas por `collapse`
    // (contínuo: no fim do fade volta exatamente à camada 1, sem pop).
    const fr = inFlash ? base[0] : gray[0];
    const fg = inFlash ? base[1] : gray[1];
    const fb = inFlash ? base[2] : gray[2];

    arr[o] = lensC[0] + (fr - lensC[0]) * collapse;
    arr[o + 1] = lensC[1] + (fg - lensC[1]) * collapse;
    arr[o + 2] = lensC[2] + (fb - lensC[2]) * collapse;
  }
  attrs.colorScale.needsUpdate = true;
}

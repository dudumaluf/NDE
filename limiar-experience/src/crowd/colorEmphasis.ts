import type { CrowdAttributes } from "../vat/vatGeometry";
import type { Content } from "../data/types";
import type { DemoClassification } from "../data/demoLens";
import type { LegendFlash } from "../ui/legendStore";
import { desaturate } from "../data/palette";

/**
 * Coesão visual (M3.5): quem NÃO pertence ao grupo em foco dessatura — a via
 * mais barata possível, re-escrevendo o MESMO iColorScale que já existe
 * (46 escritas por mudança, nada por frame, nenhum uniform/shader novo).
 *
 * Duas intensidades:
 *  - lente de elemento ativa → quem não tem o elemento fica ~35% mais cinza
 *    e um tico mais escuro (segue legível, mas recua);
 *  - "flash" da legenda (clique num chip) → todos fora do grupo clicado
 *    dessaturam forte por ~2s (o timer vive no legendStore).
 *
 * Rodar SEMPRE depois de fillContentAttributes (lê a cor base já escrita).
 */
export interface EmphasisOpts {
  /** Key do elemento da lente ativa (null = sem lente de elemento). */
  elementLens: string | null;
  /** Destaque temporário disparado pela legenda. */
  flash: LegendFlash | null;
}

export function applyColorEmphasis(
  attrs: CrowdAttributes,
  count: number,
  content: Content,
  demoCls: DemoClassification | null,
  { elementLens, flash }: EmphasisOpts,
): void {
  if (!elementLens && !flash) return;

  const people = content.manifest.people;
  const n = Math.min(people.length, count);
  const arr = attrs.colorScale.array as Float32Array;

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

    let k = 0;
    let dim = 1;
    if (flash && !inFlash) {
      k = 0.7;
      dim = 0.85;
    } else if (!flash && !inLens) {
      k = 0.35;
      dim = 0.92;
    }
    if (k === 0) continue;

    const o = i * 4;
    const [r, g, b] = desaturate([arr[o], arr[o + 1], arr[o + 2]], k, dim);
    arr[o] = r;
    arr[o + 1] = g;
    arr[o + 2] = b;
  }
  attrs.colorScale.needsUpdate = true;
}

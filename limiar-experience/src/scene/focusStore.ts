import { create } from "zustand";
import {
  clearLegendFlash,
  triggerLegendFlash,
  useLegend,
} from "../ui/legendStore";
import { useFollow } from "../ui/followStore";

/**
 * Modo FOCUS de um núcleo (2026-07-14): clicar num rótulo 3D (ou no ícone ⌖
 * de um chip da Legend) voa a câmera até o núcleo, destaca seus membros de
 * forma persistente e abre o painel de assinatura. É a camada de EXPLORAÇÃO
 * da hierarquia — o oposto do overview.
 *
 * Divisão de responsabilidades:
 *  - este store guarda só QUAL núcleo está em foco e QUAL elemento-sublente
 *    está ativo (interseção núcleo ∩ elemento);
 *  - o rig de câmera (src/scene/ClusterFocus.tsx) reage a `cluster` voando
 *    até enquadrá-lo (não toca no FollowCamera; bloqueado durante follow);
 *  - o destaque persistente é o legendStore flash com hold indefinido
 *    (kind "cluster" ou "clusterElement"), disparado/limpo daqui.
 *
 * Sair do foco NÃO teleporta a câmera de volta (fica onde está — só solta).
 */

interface FocusState {
  /** cluster_id em foco (null = sem foco). */
  cluster: number | null;
  /** Element-key da sublente ativa (interseção) ou null. */
  subElement: string | null;
}

export const useFocus = create<FocusState>(() => ({
  cluster: null,
  subElement: null,
}));

/** Entra (ou troca) o foco num núcleo. No-op durante follow (câmera ocupada). */
export function focusCluster(clusterId: number): void {
  if (useFollow.getState().following !== null) return;
  useFocus.setState({ cluster: clusterId, subElement: null });
  // Destaque persistente do núcleo (hold indefinido — some só ao sair).
  triggerLegendFlash({ kind: "cluster", id: String(clusterId) }, Infinity);
}

/**
 * Sublente v1 (interseção): destaca SÓ os membros do núcleo que têm o
 * elemento. Re-clicar no mesmo elemento volta ao destaque do núcleo inteiro.
 */
export function focusSubElement(elementKey: string): void {
  const { cluster, subElement } = useFocus.getState();
  if (cluster === null) return;
  if (subElement === elementKey) {
    useFocus.setState({ subElement: null });
    triggerLegendFlash({ kind: "cluster", id: String(cluster) }, Infinity);
    return;
  }
  useFocus.setState({ subElement: elementKey });
  triggerLegendFlash(
    { kind: "clusterElement", id: `${cluster}:${elementKey}` },
    Infinity,
  );
}

/** Sai do foco: solta o destaque (com fade) e fecha o painel. */
export function clearFocus(): void {
  if (useFocus.getState().cluster === null) return;
  useFocus.setState({ cluster: null, subElement: null });
  // Só apaga se o flash ativo é do foco (não pisa num flash comum da Legend).
  const flash = useLegend.getState().flash;
  if (flash && !Number.isFinite(flash.holdMs)) clearLegendFlash();
}

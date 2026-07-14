import { create } from "zustand";

/**
 * Pessoa sob o mouse (M4c): índice do slot (= índice no manifest.people) ou
 * null. Escrito pelo PersonHover por frame; lido pelo follow (M4d) no clique.
 */
export interface HoverState {
  hovered: number | null;
}

export const useHover = create<HoverState>(() => ({ hovered: null }));

export function setHovered(i: number | null): void {
  if (useHover.getState().hovered !== i) useHover.setState({ hovered: i });
}

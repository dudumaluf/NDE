import { create } from "zustand";
import type { DemoClassification } from "./demoLens";

/**
 * Ponte CrowdMesh (dentro do Canvas) → HUD (DOM): a classificação da lente
 * demográfica ativa, para a legenda textual (categoria → contagem).
 */
export const useDemoLens = create<{ cls: DemoClassification | null }>(() => ({
  cls: null,
}));

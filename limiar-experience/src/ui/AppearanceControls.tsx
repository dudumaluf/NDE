import { useEffect } from "react";
import { useControls } from "leva";
import { pref } from "../lib/prefs";
import { APPEARANCE_DEFAULTS as DEF, useAppearance } from "./appearanceStore";

/**
 * Grupo "Aparência" do leva (pedido do Dudu, 2026-07-12): as cores do mundo
 * num lugar só — fundo, névoa (que hoje nasce amarrada ao fundo, com opção
 * de soltar), chão, grid — e o ajuste GLOBAL de matiz/saturação/brilho das
 * PESSOAS (paleta de núcleos + dormentes, via re-escrita do iColorScale como
 * o colorEmphasis faz: CPU no evento, zero custo por frame). Também moram
 * aqui os sliders do destaque da legenda (intensidade/duração).
 *
 * O componente só publica no useAppearance (zustand); quem consome é
 * Scene.tsx (fundo/chão/grid), PostFX (cor da névoa) e CrowdMesh (HSB +
 * destaque). Não há céu/dome na cena — o "céu" é o próprio fundo.
 *
 * Tudo persiste pelo grupo Preferências (item 1 do pedido) — os defaults
 * passam por pref().
 */
export function AppearanceControls() {
  const a = useControls(
    "Appearance",
    {
      fundo: { value: pref("Appearance.fundo", DEF.fundo), label: "background (sky)" },
      nevoaSegueFundo: {
        value: pref("Appearance.nevoaSegueFundo", true),
        label: "fog follows background",
      },
      nevoaCor: {
        value: pref("Appearance.nevoaCor", DEF.nevoaCor),
        label: "fog color",
        render: (get) => !get("Appearance.nevoaSegueFundo"),
      },
      chao: { value: pref("Appearance.chao", DEF.chao), label: "ground" },
      gridCor: { value: pref("Appearance.gridCor", DEF.gridCor), label: "grid color" },
      gridAlpha: {
        value: pref("Appearance.gridAlpha", DEF.gridAlpha),
        min: 0,
        max: 1,
        label: "grid alpha",
      },
      matiz: {
        value: pref("Appearance.matiz", DEF.hsb.hue),
        min: -180,
        max: 180,
        step: 1,
        label: "people: hue (°)",
      },
      saturacao: {
        value: pref("Appearance.saturacao", DEF.hsb.sat),
        min: 0,
        max: 2,
        label: "people: saturation",
      },
      brilho: {
        value: pref("Appearance.brilho", DEF.hsb.bri),
        min: 0,
        max: 2,
        label: "people: brightness",
      },
      destaqueIntensidade: {
        value: pref("Appearance.destaqueIntensidade", DEF.destaqueIntensidade),
        min: 0,
        max: 1,
        label: "highlight: intensity",
      },
      destaqueDuracao: {
        value: pref("Appearance.destaqueDuracao", DEF.destaqueDuracao),
        min: 0.3,
        max: 8,
        label: "highlight: duration (s)",
      },
    },
    { collapsed: true },
  );

  useEffect(() => {
    useAppearance.setState({
      fundo: a.fundo,
      nevoaCor: a.nevoaSegueFundo ? a.fundo : a.nevoaCor,
      chao: a.chao,
      gridCor: a.gridCor,
      gridAlpha: a.gridAlpha,
      hsb: { hue: a.matiz, sat: a.saturacao, bri: a.brilho },
      destaqueIntensidade: a.destaqueIntensidade,
      destaqueDuracao: a.destaqueDuracao,
    });
  }, [
    a.fundo,
    a.nevoaSegueFundo,
    a.nevoaCor,
    a.chao,
    a.gridCor,
    a.gridAlpha,
    a.matiz,
    a.saturacao,
    a.brilho,
    a.destaqueIntensidade,
    a.destaqueDuracao,
  ]);

  return null;
}

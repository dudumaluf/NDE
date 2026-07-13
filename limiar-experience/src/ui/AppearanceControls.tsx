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
    "Aparência",
    {
      fundo: { value: pref("Aparência.fundo", DEF.fundo), label: "fundo (céu)" },
      nevoaSegueFundo: {
        value: pref("Aparência.nevoaSegueFundo", true),
        label: "névoa segue fundo",
      },
      nevoaCor: {
        value: pref("Aparência.nevoaCor", DEF.nevoaCor),
        label: "névoa cor",
        render: (get) => !get("Aparência.nevoaSegueFundo"),
      },
      chao: { value: pref("Aparência.chao", DEF.chao), label: "chão" },
      gridCor: { value: pref("Aparência.gridCor", DEF.gridCor), label: "grid cor" },
      gridAlpha: {
        value: pref("Aparência.gridAlpha", DEF.gridAlpha),
        min: 0,
        max: 1,
        label: "grid alpha",
      },
      matiz: {
        value: pref("Aparência.matiz", DEF.hsb.hue),
        min: -180,
        max: 180,
        step: 1,
        label: "pessoas: matiz (°)",
      },
      saturacao: {
        value: pref("Aparência.saturacao", DEF.hsb.sat),
        min: 0,
        max: 2,
        label: "pessoas: saturação",
      },
      brilho: {
        value: pref("Aparência.brilho", DEF.hsb.bri),
        min: 0,
        max: 2,
        label: "pessoas: brilho",
      },
      destaqueIntensidade: {
        value: pref("Aparência.destaqueIntensidade", DEF.destaqueIntensidade),
        min: 0,
        max: 1,
        label: "destaque: intensidade",
      },
      destaqueDuracao: {
        value: pref("Aparência.destaqueDuracao", DEF.destaqueDuracao),
        min: 0.3,
        max: 8,
        label: "destaque: duração (s)",
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

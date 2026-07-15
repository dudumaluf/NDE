import { TL_W } from "./timelineZoom";

/** Tamanhos em px de tela — não escalam quando a régua fica mais larga. */
export interface TimelineScreenLayout {
  stationDotPx: number;
  momentDotPx: number;
  quoteDotPx: number;
  labelFontPx: number;
  labelCharPx: number;
  labelGapPx: number;
  dotGapPx: number;
  stationHitPx: number;
  momentHitPx: number;
  lineYPx: number;
  labelYPx: number;
  infoFontPx: number;
  headerFontPx: number;
}

export interface TimelineSvgLayout {
  stationDotR: number;
  momentDotR: number;
  quoteDotR: number;
  labelFont: number;
  labelCharW: number;
  labelGap: number;
  dotGap: number;
  stationHitR: number;
  momentHitR: number;
  lineY: number;
  labelY: number;
}

export const DEFAULT_TIMELINE_SCREEN: TimelineScreenLayout = {
  stationDotPx: 5.5,
  momentDotPx: 2.8,
  quoteDotPx: 3.2,
  labelFontPx: 8,
  labelCharPx: 5.4,
  labelGapPx: 10,
  dotGapPx: 5,
  stationHitPx: 12,
  momentHitPx: 9,
  lineYPx: 18,
  labelYPx: 40,
  infoFontPx: 12.5,
  headerFontPx: 10,
};

export function svgScale(clientWidth: number): number {
  return Math.max(clientWidth, 1) / TL_W;
}

/** Converte px de tela → unidades do viewBox (compensa o stretch do SVG). */
export function pxToSvg(px: number, clientWidth: number): number {
  return px / svgScale(clientWidth);
}

export function toSvgLayout(
  screen: TimelineScreenLayout,
  clientWidth: number,
): TimelineSvgLayout {
  const p = (n: number) => pxToSvg(n, clientWidth);
  return {
    stationDotR: p(screen.stationDotPx),
    momentDotR: p(screen.momentDotPx),
    quoteDotR: p(screen.quoteDotPx),
    labelFont: p(screen.labelFontPx),
    labelCharW: p(screen.labelCharPx),
    labelGap: p(screen.labelGapPx),
    dotGap: p(screen.dotGapPx),
    stationHitR: p(screen.stationHitPx),
    momentHitR: p(screen.momentHitPx),
    lineY: p(screen.lineYPx),
    labelY: p(screen.labelYPx),
  };
}

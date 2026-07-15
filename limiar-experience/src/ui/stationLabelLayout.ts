import { TL_PAD_X, TL_W } from "./timelineZoom";
import type { TimelineSvgLayout } from "./timelineLayout";

export type TimelineMarkerKind = "station" | "moment";

export interface TimelineMarker {
  anchorX: number;
  kind: TimelineMarkerKind;
  label?: string;
}

export interface SpreadTimelineItem {
  anchorX: number;
  displayX: number;
  kind: TimelineMarkerKind;
}

interface SpreadNode {
  anchorX: number;
  half: number;
  kind: TimelineMarkerKind;
  i: number;
}

function markerHalf(m: TimelineMarker, layout: TimelineSvgLayout): number {
  if (m.kind === "station") {
    return Math.max(
      layout.stationDotR,
      ((m.label ?? "").length * layout.labelCharW) / 2,
    );
  }
  return layout.stationDotR;
}

function markerGap(a: SpreadNode, b: SpreadNode, layout: TimelineSvgLayout): number {
  if (a.kind === "station" && b.kind === "station") return layout.labelGap;
  return layout.dotGap;
}

function clampSpread(
  sorted: SpreadNode[],
  xs: number[],
  layout: TimelineSvgLayout,
): void {
  const n = sorted.length;
  const minBound = TL_PAD_X;
  const maxBound = TL_W - TL_PAD_X;

  for (let i = 1; i < n; i++) {
    const gap = markerGap(sorted[i - 1], sorted[i], layout);
    const minXi =
      xs[i - 1] + sorted[i - 1].half + gap + sorted[i].half;
    if (xs[i] < minXi) xs[i] = minXi;
  }

  if (xs[n - 1] + sorted[n - 1].half > maxBound) {
    xs[n - 1] = maxBound - sorted[n - 1].half;
    for (let i = n - 2; i >= 0; i--) {
      const gap = markerGap(sorted[i], sorted[i + 1], layout);
      const maxXi =
        xs[i + 1] - gap - sorted[i].half - sorted[i + 1].half;
      if (xs[i] > maxXi) xs[i] = maxXi;
    }
  }

  if (xs[0] - sorted[0].half < minBound) {
    xs[0] = minBound + sorted[0].half;
    for (let i = 1; i < n; i++) {
      const gap = markerGap(sorted[i - 1], sorted[i], layout);
      const minXi =
        xs[i - 1] + sorted[i - 1].half + gap + sorted[i].half;
      if (xs[i] < minXi) xs[i] = minXi;
    }
  }

  const rightEdge = xs[n - 1] + sorted[n - 1].half;
  const leftEdge = xs[0] - sorted[0].half;
  if (rightEdge > maxBound && rightEdge > leftEdge) {
    const avail = maxBound - minBound;
    const used = rightEdge - leftEdge;
    const scale = avail / used;
    const base = xs[0];
    for (let i = 1; i < n; i++) xs[i] = base + (xs[i] - base) * scale;
    xs[0] = Math.max(xs[0], minBound + sorted[0].half);
    for (let i = 1; i < n; i++) {
      const gap = markerGap(sorted[i - 1], sorted[i], layout);
      const minXi =
        xs[i - 1] + sorted[i - 1].half + gap + sorted[i].half;
      if (xs[i] < minXi) xs[i] = minXi;
    }
  }
}

/**
 * Estações + momentos na mesma régua: todos participam do spread com âncora
 * em t_norm. `layout` traz raios/gaps em unidades SVG já compensadas para px
 * de tela fixos.
 */
export function spreadTimelineMarkers(
  items: TimelineMarker[],
  layout: TimelineSvgLayout,
): SpreadTimelineItem[] {
  if (items.length === 0) return [];

  const sorted: SpreadNode[] = items
    .map((it, i) => ({
      anchorX: it.anchorX,
      kind: it.kind,
      i,
      half: markerHalf(it, layout),
    }))
    .sort((a, b) => a.anchorX - b.anchorX);

  const n = sorted.length;
  const xs = sorted.map((it) => it.anchorX);
  clampSpread(sorted, xs, layout);

  const out: SpreadTimelineItem[] = items.map((it) => ({
    anchorX: it.anchorX,
    displayX: it.anchorX,
    kind: it.kind,
  }));
  for (let j = 0; j < n; j++) {
    out[sorted[j].i] = {
      anchorX: sorted[j].anchorX,
      displayX: xs[j],
      kind: sorted[j].kind,
    };
  }
  return out;
}

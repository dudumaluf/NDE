import { useEffect } from "react";
import { useControls } from "leva";
import { prefBool, prefNum } from "../lib/prefs";
import {
  FOCUS_READING_DEFAULTS as DEF,
  useFocusReading,
} from "./focusReadingStore";

/**
 * Grupo "Focus & reading" do leva (2026-07-14): os controles da camada de
 * hierarquia visual e exploração dos núcleos. Arquivo próprio (montado em
 * App.tsx como AppearanceControls) para NÃO tocar CrowdMesh — território da
 * Multidão, editado em paralelo.
 *
 * Só publica no zustand (useFocusReading); quem consome é ClusterLabels
 * (anti-colisão + escala), ClusterOutlines (contornos) e DataViewDiscs (LOD).
 * Defaults pref()-wrapped (persistem pelo grupo Preferences; query params
 * vencem — screenshots reproduzíveis).
 */
export function FocusControls() {
  const a = useControls(
    "Focus & reading",
    {
      labelAntiOverlap: {
        value: prefBool("labelAnti", "Focus & reading.labelAntiOverlap", DEF.labelAntiOverlap),
        label: "label anti-overlap",
        hint: "screen-space collision of cluster words: overlapping labels push the smaller (fewer members) upward with a spring, and it fades a touch when the camera is too far to separate them",
      },
      labelDistScale: {
        value: prefNum("labelDist", "Focus & reading.labelDistScale", DEF.labelDistScale),
        min: 0,
        max: 1,
        label: "label distance falloff",
        hint: "how much labels shrink with camera distance (reading hierarchy) — clamped so far labels stay legible",
      },
      outlines: {
        value: prefBool("outlines", "Focus & reading.outlines", DEF.outlines),
        label: "cluster outlines",
        hint: "a soft spline drawn on the ground around each FORMED cluster (needs gravity on). Sampled ~0.3 s, breathes gently — a few hundred line points, ~free",
      },
      outlineAlpha: {
        value: prefNum("outlineAlpha", "Focus & reading.outlineAlpha", DEF.outlineAlpha),
        min: 0,
        max: 0.6,
        label: "outline alpha",
      },
      dataView: {
        value: prefBool("dataView", "Focus & reading.dataView", DEF.dataView),
        label: "data view (birdseye)",
        hint: "above the data-view height the people crossfade to flat colored discs on the ground — the circle-packing reading of the whole corpus (1 draw call, positions read from the sim's storage buffer, ~free)",
      },
      dataViewHeight: {
        value: prefNum("dataViewH", "Focus & reading.dataViewHeight", DEF.dataViewHeight),
        min: 20,
        max: 120,
        label: "data view height",
      },
      dataViewBand: {
        value: prefNum("dataViewBand", "Focus & reading.dataViewBand", DEF.dataViewBand),
        min: 2,
        max: 60,
        label: "data view fade band",
      },
      discSize: {
        value: prefNum("discSize", "Focus & reading.discSize", DEF.discSize),
        min: 0.2,
        max: 3,
        label: "disc size",
      },
    },
    { collapsed: true },
  );

  useEffect(() => {
    useFocusReading.setState({
      labelAntiOverlap: a.labelAntiOverlap,
      labelDistScale: a.labelDistScale,
      outlines: a.outlines,
      outlineAlpha: a.outlineAlpha,
      dataView: a.dataView,
      dataViewHeight: a.dataViewHeight,
      dataViewBand: a.dataViewBand,
      discSize: a.discSize,
    });
  }, [
    a.labelAntiOverlap,
    a.labelDistScale,
    a.outlines,
    a.outlineAlpha,
    a.dataView,
    a.dataViewHeight,
    a.dataViewBand,
    a.discSize,
  ]);

  return null;
}

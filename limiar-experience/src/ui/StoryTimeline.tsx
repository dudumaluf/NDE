import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControls } from "leva";
import { useContent } from "../data/contentStore";
import {
  clearPerson,
  loadPerson,
  setActiveBeat,
  usePerson,
  type PersonBeat,
} from "../data/personStore";
import { useFollow } from "./followStore";
import { useLegend } from "./legendStore";
import { cssColor, demoRampColor } from "../data/palette";
import { computeStations, chapterIndexForT } from "./timelineStations";
import { spreadTimelineMarkers } from "./stationLabelLayout";
import {
  DEFAULT_TIMELINE_SCREEN,
  pxToSvg,
  toSvgLayout,
  type TimelineScreenLayout,
} from "./timelineLayout";
import {
  formatTime,
  lerpX,
  morphZoomTarget,
  momentZoomX,
  easeInOutCubic,
  stationZoomOpacity,
  stationZoomX,
  TL_PAD_X,
  TL_W,
  type ZoomMorphSnap,
} from "./timelineZoom";
import { prefNum, prefStr } from "../lib/prefs";
import {
  beatCut,
  ensureAudioIndex,
  quoteCut,
  setPlaying,
  toggleMuted,
  useAudioIndex,
  type Cut,
} from "../audio/cuts";
import * as player from "../audio/player";

/**
 * Timeline da história — uma linha em t_norm (2026-07-15).
 * Estações = marcos canônicos (bolinha maior + rótulo) no tempo real do beat;
 * momentos = pontos finos entre eles. Zoom/peek nos capítulos; clique no
 * momento toca o beat sem zoom.
 */

const FONT_STACK =
  '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

const W = TL_W;
const H = 72;
const PAD_X = TL_PAD_X;

const TL_MODES = ["stations", "all", "element"] as const;
type TimelineMode = (typeof TL_MODES)[number];

const TEXT_SHADOW = "0 1px 12px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.45)";
/** Zoom overview → capítulo (ease-in-out, ms). */
const ZOOM_IN_MS = 1200;
/** Recolher capítulo → overview. */
const ZOOM_OUT_MS = 800;
/** Morph entre capítulos já em zoom. */
const ZOOM_MORPH_SPEED = 0.09;
/** Overview da régua inteira antes do zoom no 1º capítulo (auto-play no follow). */
const AUTO_PLAY_OVERVIEW_MS = 750;

function valenceColor(v: number): string {
  return cssColor(demoRampColor((Math.max(-2, Math.min(2, v)) + 2) / 4));
}

const ELEMENT_DOT = "rgb(237, 222, 184)";

function xOf(t: number): number {
  return PAD_X + t * (W - PAD_X * 2);
}

interface TimelineDot {
  key: string;
  track: "station" | "moment" | "quote";
  overviewX: number;
  zoomX: number;
  zoomOpacity: number;
  color: string;
  r: number;
  label: string | null;
  isVirada: boolean;
  info: string;
  beatIndex: number | null;
  stationIndex: number | null;
  cut: Cut | null;
}

function InfoLine({ text, fontSize }: { text: string | null; fontSize: number }) {
  const [shown, setShown] = useState(text);
  const [visible, setVisible] = useState(Boolean(text));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (text === shown) {
      setVisible(Boolean(text));
      return;
    }
    setVisible(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(text);
      setVisible(Boolean(text));
    }, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, shown]);

  return (
    <div
      style={{
        minHeight: 40,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 12px 9px",
        fontSize,
        fontWeight: 300,
        letterSpacing: "0.04em",
        lineHeight: 1.45,
        color: "rgba(235, 230, 222, 0.92)",
        textShadow: TEXT_SHADOW,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 4}px)`,
        transition: "opacity 0.2s ease, transform 0.2s ease",
        pointerEvents: "none",
      }}
    >
      {shown}
    </div>
  );
}

export function StoryTimeline() {
  const content = useContent((s) => s.content);
  const following = useFollow((s) => s.following);
  const person = usePerson((s) => s.person);
  const personId = usePerson((s) => s.personId);
  const activeBeat = usePerson((s) => s.activeBeat);
  const elementLens = useLegend((s) => s.elementLens);
  const audioIndex = useAudioIndex((s) => s.index);
  const audioReady = useAudioIndex((s) => s.ready);
  const playing = useAudioIndex((s) => s.playing);
  const muted = useAudioIndex((s) => s.muted);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [peekUi, setPeekUi] = useState(false);
  const [focusStationIdx, setFocusStationIdx] = useState<number | null>(null);
  const [focusMomentT, setFocusMomentT] = useState<number | null>(null);
  const zoomK = useRef(0);
  const zoomTarget = useRef(0);
  const prevZoomTarget = useRef(0);
  const zoomAnim = useRef<{
    from: number;
    to: number;
    start: number;
    dur: number;
  } | null>(null);
  const morphK = useRef(1);
  const morphSnapshotRef = useRef<Record<string, ZoomMorphSnap>>({});
  const prevDotsRef = useRef<TimelineDot[]>([]);
  const prevFocusRef = useRef<{ station: number | null; momentT: number | null }>({
    station: null,
    momentT: null,
  });
  const peekLatched = useRef(false);
  const sessionEndRef = useRef(false);
  /** Follow slot que ainda não recebeu auto-play desta entrada (doc 04 §4.1). */
  const autoPlayFor = useRef<number | null>(null);
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusRef = useRef<number | null>(null);
  focusRef.current = focusStationIdx;

  const clearAutoPlayTimer = useCallback(() => {
    if (autoPlayTimer.current !== null) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  const resetZoomMotion = useCallback(() => {
    zoomK.current = 0;
    zoomTarget.current = 0;
    prevZoomTarget.current = 0;
    zoomAnim.current = null;
    morphK.current = 1;
  }, []);

  const [{ tlmode }, setTl] = useControls("Scene", () => ({
    tlmode: {
      value: prefStr<TimelineMode>("tlmode", "Scene.tlmode", "stations", TL_MODES),
      options: { stations: "stations (régua)", element: "element" },
      label: "timeline mode",
      hint: "stations = capítulos + momentos; element = quotes da lente ativa",
    },
  }));

  const [
    {
      widthVw: tlVw,
      widthMax: tlMax,
      widthMin: tlMin,
      bottom: tlBottom,
      stationDotPx,
      momentDotPx,
      quoteDotPx,
      labelFontPx,
      labelCharPx,
      labelGapPx,
      dotGapPx,
      stationHitPx,
      momentHitPx,
      lineYPx,
      labelYPx,
      infoFontPx,
      headerFontPx,
    },
  ] = useControls(
    "Timeline",
    () => ({
      widthVw: {
        value: prefNum("tlVw", "Timeline.widthVw", 72),
        min: 40,
        max: 92,
        step: 1,
        label: "width % viewport",
      },
      widthMax: {
        value: prefNum("tlMax", "Timeline.widthMax", 960),
        min: 560,
        max: 1400,
        step: 10,
        label: "width max px",
      },
      widthMin: {
        value: prefNum("tlMin", "Timeline.widthMin", 480),
        min: 320,
        max: 900,
        step: 10,
        label: "width min px",
      },
      bottom: {
        value: prefNum("tlBottom", "Timeline.bottom", 26),
        min: 8,
        max: 120,
        step: 1,
        label: "bottom px",
      },
      stationDotPx: {
        value: prefNum("tlStDot", "Timeline.stationDotPx", DEFAULT_TIMELINE_SCREEN.stationDotPx),
        min: 2,
        max: 14,
        step: 0.1,
        label: "station dot px",
      },
      momentDotPx: {
        value: prefNum("tlMoDot", "Timeline.momentDotPx", DEFAULT_TIMELINE_SCREEN.momentDotPx),
        min: 1,
        max: 10,
        step: 0.1,
        label: "moment dot px",
      },
      quoteDotPx: {
        value: prefNum("tlQtDot", "Timeline.quoteDotPx", DEFAULT_TIMELINE_SCREEN.quoteDotPx),
        min: 1,
        max: 10,
        step: 0.1,
        label: "quote dot px",
      },
      labelFontPx: {
        value: prefNum("tlLblFont", "Timeline.labelFontPx", DEFAULT_TIMELINE_SCREEN.labelFontPx),
        min: 5,
        max: 16,
        step: 0.5,
        label: "label font px",
      },
      labelCharPx: {
        value: prefNum("tlLblChar", "Timeline.labelCharPx", DEFAULT_TIMELINE_SCREEN.labelCharPx),
        min: 3,
        max: 12,
        step: 0.1,
        label: "label char width px",
      },
      labelGapPx: {
        value: prefNum("tlLblGap", "Timeline.labelGapPx", DEFAULT_TIMELINE_SCREEN.labelGapPx),
        min: 2,
        max: 24,
        step: 1,
        label: "label gap px",
      },
      dotGapPx: {
        value: prefNum("tlDotGap", "Timeline.dotGapPx", DEFAULT_TIMELINE_SCREEN.dotGapPx),
        min: 1,
        max: 16,
        step: 0.5,
        label: "dot gap px",
      },
      stationHitPx: {
        value: prefNum("tlStHit", "Timeline.stationHitPx", DEFAULT_TIMELINE_SCREEN.stationHitPx),
        min: 6,
        max: 24,
        step: 1,
        label: "station hit px",
      },
      momentHitPx: {
        value: prefNum("tlMoHit", "Timeline.momentHitPx", DEFAULT_TIMELINE_SCREEN.momentHitPx),
        min: 4,
        max: 20,
        step: 1,
        label: "moment hit px",
      },
      lineYPx: {
        value: prefNum("tlLineY", "Timeline.lineYPx", DEFAULT_TIMELINE_SCREEN.lineYPx),
        min: 8,
        max: 36,
        step: 1,
        label: "line Y px",
      },
      labelYPx: {
        value: prefNum("tlLblY", "Timeline.labelYPx", DEFAULT_TIMELINE_SCREEN.labelYPx),
        min: 20,
        max: 56,
        step: 1,
        label: "label Y px",
      },
      infoFontPx: {
        value: prefNum("tlInfoFont", "Timeline.infoFontPx", DEFAULT_TIMELINE_SCREEN.infoFontPx),
        min: 9,
        max: 20,
        step: 0.5,
        label: "info font px",
      },
      headerFontPx: {
        value: prefNum("tlHdrFont", "Timeline.headerFontPx", DEFAULT_TIMELINE_SCREEN.headerFontPx),
        min: 7,
        max: 16,
        step: 0.5,
        label: "header font px",
      },
    }),
    { collapsed: true },
  );

  const shellRef = useRef<HTMLDivElement>(null);
  const [svgClientWidth, setSvgClientWidth] = useState(TL_W);
  const layoutRef = useRef(toSvgLayout(DEFAULT_TIMELINE_SCREEN, TL_W));

  const screenLayout = useMemo<TimelineScreenLayout>(
    () => ({
      stationDotPx,
      momentDotPx,
      quoteDotPx,
      labelFontPx,
      labelCharPx,
      labelGapPx,
      dotGapPx,
      stationHitPx,
      momentHitPx,
      lineYPx,
      labelYPx,
      infoFontPx,
      headerFontPx,
    }),
    [
      stationDotPx,
      momentDotPx,
      quoteDotPx,
      labelFontPx,
      labelCharPx,
      labelGapPx,
      dotGapPx,
      stationHitPx,
      momentHitPx,
      lineYPx,
      labelYPx,
      infoFontPx,
      headerFontPx,
    ],
  );

  const svgLayout = useMemo(
    () => toSvgLayout(screenLayout, svgClientWidth),
    [screenLayout, svgClientWidth],
  );
  layoutRef.current = svgLayout;

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const sync = () => setSvgClientWidth(el.getBoundingClientRect().width);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [following, person]);

  useEffect(() => {
    if (following !== null && content) {
      const p = content.manifest.people[following];
      if (p) loadPerson(p.id);
      ensureAudioIndex();
      autoPlayFor.current = following;
      return () => {
        autoPlayFor.current = null;
        clearAutoPlayTimer();
        clearPerson();
        void player.stop();
        setPlaying(null);
        setFocusStationIdx(null);
        setFocusMomentT(null);
        resetZoomMotion();
        peekLatched.current = false;
        sessionEndRef.current = false;
      };
    }
  }, [following, content, clearAutoPlayTimer, resetZoomMotion]);

  const rawMode = tlmode as TimelineMode;
  // "all" era o modo antigo só-momentos; visitante sempre vê régua unificada.
  const mode: TimelineMode =
    rawMode === "all" || (rawMode === "element" && !elementLens)
      ? "stations"
      : rawMode;

  useEffect(() => {
    if (tlmode === "all") setTl({ tlmode: "stations" });
  }, [tlmode, setTl]);

  const [shownMode, setShownMode] = useState<TimelineMode>(mode);
  const [dotsVisible, setDotsVisible] = useState(true);
  useEffect(() => {
    if (mode === shownMode) return;
    setDotsVisible(false);
    setHoverKey(null);
    setPeekUi(false);
    peekLatched.current = false;
    setFocusStationIdx(null);
    setFocusMomentT(null);
    zoomTarget.current = 0;
    const t = setTimeout(() => {
      setShownMode(mode);
      setDotsVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [mode, shownMode]);

  const emotion = useMemo(
    () =>
      new Map(
        (person?.arc.beats_emotion ?? []).map((e) => [e.beat_index, e]),
      ),
    [person],
  );

  const stationCount = useMemo(
    () => (person ? computeStations(person).length : 0),
    [person],
  );

  const dots = useMemo<TimelineDot[]>(() => {
    if (!person) return [];
    const focus = focusStationIdx ?? 0;

    if (shownMode !== "element") {
      const stations = computeStations(person);
      const n = stations.length;
      const stationBeatIds = new Set(stations.map((st) => st.beat.beat_index));
      const focusT = stations[focus]?.beat.t_norm ?? 0;
      const nextT = stations[focus + 1]?.beat.t_norm ?? 1;
      const momentLeftT = focusMomentT ?? focusT;
      const subZoom = focusMomentT !== null;

      const inMomentWindow = (t: number) =>
        t >= momentLeftT - 0.001 && t <= nextT + 0.001;

      const stationMarkers = stations.map((st) => ({
        anchorX: xOf(st.beat.t_norm),
        label: st.label,
      }));
      const momentAnchors = person.beats
        .filter((b) => !stationBeatIds.has(b.beat_index))
        .map((b) => ({ beat: b, anchorX: xOf(b.t_norm) }));

      const spread = spreadTimelineMarkers(
        [
          ...stationMarkers.map((m) => ({
            anchorX: m.anchorX,
            kind: "station" as const,
            label: m.label,
          })),
          ...momentAnchors.map((m) => ({
            anchorX: m.anchorX,
            kind: "moment" as const,
          })),
        ],
        svgLayout,
      );

      const stationSpread = spread.filter((s) => s.kind === "station");
      const momentSpread = spread.filter((s) => s.kind === "moment");

      const stationDots: TimelineDot[] = stations.map((st, i) => {
        const e = emotion.get(st.beat.beat_index);
        const ox = stationSpread[i].displayX;
        return {
          key: `st:${st.key}`,
          track: "station",
          overviewX: ox,
          zoomX: subZoom
            ? momentZoomX(st.beat.t_norm, momentLeftT, nextT)
            : stationZoomX(i, focus, n),
          zoomOpacity: subZoom
            ? inMomentWindow(st.beat.t_norm)
              ? 1
              : 0.15
            : stationZoomOpacity(i, focus, n),
          color: valenceColor(e?.valence ?? 0),
          r: svgLayout.stationDotR,
          label: st.label,
          isVirada: st.isVirada,
          info: (e?.label ? `${e.label} — ` : "") + st.beat.summary,
          beatIndex: st.beat.beat_index,
          stationIndex: i,
          cut: beatCut(person, st.beat.beat_index, audioIndex),
        };
      });

      const momentDots: TimelineDot[] = momentAnchors.map(({ beat: b }, i) => {
        const e = emotion.get(b.beat_index);
        const ox = momentSpread[i].displayX;
        const inWindow = inMomentWindow(b.t_norm);
        return {
          key: `beat:${b.beat_index}`,
          track: "moment",
          overviewX: ox,
          zoomX: momentZoomX(b.t_norm, momentLeftT, nextT),
          zoomOpacity: inWindow ? 1 : 0.2,
          color: valenceColor(e?.valence ?? 0),
          r: svgLayout.momentDotR,
          label: null,
          isVirada: person.arc.virada === b.beat_index,
          info: (e?.label ? `${e.label} — ` : "") + b.summary,
          beatIndex: b.beat_index,
          stationIndex: null,
          cut: beatCut(person, b.beat_index, audioIndex),
        };
      });
      return [...stationDots, ...momentDots];
    }

    const el = person.elements?.find((e) => e.key === elementLens);
    const quotes = (el?.quotes ?? [])
      .map((q, qi) => ({ q, qi }))
      .sort((a, b) => a.q.t_norm - b.q.t_norm);
    const containing = (t: number): PersonBeat | undefined =>
      person.beats.find((b) => t >= b.t_norm && t <= b.t_norm_end) ??
      [...person.beats].sort(
        (a, b) => Math.abs(a.t_norm - t) - Math.abs(b.t_norm - t),
      )[0];
    return quotes.map(({ q, qi }, i) => {
      const beatIndex = containing(q.t_norm)?.beat_index ?? null;
      const x = xOf(q.t_norm);
      return {
        key: `q:${i}`,
        track: "quote",
        overviewX: x,
        zoomX: x,
        zoomOpacity: 1,
        color: ELEMENT_DOT,
        r: svgLayout.quoteDotR,
        label: null,
        isVirada: false,
        info: `“${q.text}”`,
        beatIndex,
        stationIndex: null,
        cut: elementLens
          ? quoteCut(person, elementLens, qi, beatIndex, audioIndex)
          : null,
      };
    });
  }, [person, shownMode, elementLens, emotion, audioIndex, focusStationIdx, focusMomentT, svgLayout]);

  useEffect(() => {
    const prevDots = prevDotsRef.current;
    const pf = prevFocusRef.current;
    const focusChanged =
      pf.station !== focusStationIdx || pf.momentT !== focusMomentT;

    if (
      focusChanged &&
      focusStationIdx !== null &&
      zoomK.current > 0.02 &&
      prevDots.length > 0
    ) {
      const snap: Record<string, ZoomMorphSnap> = {};
      for (const d of prevDots) {
        snap[d.key] = { zx: d.zoomX, zo: d.zoomOpacity };
      }
      morphSnapshotRef.current = snap;
      morphK.current = 0;
    }

    if (focusStationIdx === null) {
      morphK.current = 1;
      morphSnapshotRef.current = {};
    }

    prevFocusRef.current = { station: focusStationIdx, momentT: focusMomentT };
    prevDotsRef.current = dots;
  }, [dots, focusStationIdx, focusMomentT]);

  const zoomOut = useCallback(() => {
    peekLatched.current = false;
    setPeekUi(false);
    sessionEndRef.current = true;
    zoomTarget.current = 0;
    setFocusMomentT(null);
    void player.stop();
    setPlaying(null);
    setActiveBeat(null);
  }, []);

  const playBeat = useCallback((beatIndex: number, cut: Cut | null) => {
    setActiveBeat(beatIndex);
    if (!cut) {
      void player.stop();
      setPlaying(null);
      return;
    }
    setPlaying(cut);
    void player
      .play(cut.url, {
        onEnd: () => {
          if (useAudioIndex.getState().playing?.url === cut.url) setPlaying(null);
        },
      })
      .then((ok) => {
        if (!ok && useAudioIndex.getState().playing?.url === cut.url)
          setPlaying(null);
      });
  }, []);

  const playStation = useCallback(
    (stationIdx: number, beatIndex: number, cut: Cut | null) => {
      setFocusStationIdx(stationIdx);
      setFocusMomentT(null);
      peekLatched.current = false;
      sessionEndRef.current = false;
      zoomTarget.current = 1;
      setActiveBeat(beatIndex);
      if (!cut) {
        void player.stop();
        setPlaying(null);
        return;
      }
      setPlaying(cut);
      void player
        .play(cut.url, {
          onEnd: () => {
            if (useAudioIndex.getState().playing?.url === cut.url) {
              setPlaying(null);
              peekLatched.current = false;
              sessionEndRef.current = true;
              zoomTarget.current = 0;
              setActiveBeat(null);
            }
          },
        })
        .then((ok) => {
          if (!ok && useAudioIndex.getState().playing?.url === cut.url)
            setPlaying(null);
        });
    },
    [],
  );

  const goStation = useCallback(
    (idx: number) => {
      if (!person || shownMode === "element") return;
      clearAutoPlayTimer();
      autoPlayFor.current = null;
      const stations = computeStations(person);
      const st = stations[idx];
      if (!st) return;
      const cut = beatCut(person, st.beat.beat_index, audioIndex);
      setPeekUi(false);
      peekLatched.current = false;
      playStation(idx, st.beat.beat_index, cut);
    },
    [person, shownMode, audioIndex, playStation, clearAutoPlayTimer],
  );

  // Clique = compromisso (doc 04 §4.1): overview breve → zoom no 1º capítulo + voz.
  useEffect(() => {
    if (following === null || !person || !content || !audioReady) return;
    if (autoPlayFor.current !== following) return;
    if (autoPlayTimer.current !== null) return;

    const expected = content.manifest.people[following];
    if (!expected || person.id !== expected.id || personId !== expected.id)
      return;
    if (shownMode === "element") {
      autoPlayFor.current = null;
      return;
    }

    const stations = computeStations(person);
    if (stations.length === 0) {
      autoPlayFor.current = null;
      return;
    }

    let stationIdx = 0;
    for (let i = 0; i < stations.length; i++) {
      if (beatCut(person, stations[i].beat.beat_index, audioIndex)) {
        stationIdx = i;
        break;
      }
    }

    const ticket = following;
    autoPlayTimer.current = setTimeout(() => {
      autoPlayTimer.current = null;
      autoPlayFor.current = null;
      if (useFollow.getState().following !== ticket) return;
      goStation(stationIdx);
    }, AUTO_PLAY_OVERVIEW_MS);

    return () => clearAutoPlayTimer();
  }, [
    following,
    person,
    personId,
    content,
    audioReady,
    audioIndex,
    shownMode,
    goStation,
    clearAutoPlayTimer,
  ]);

  const armPeek = useCallback(() => {
    if (focusRef.current === null) return;
    peekLatched.current = true;
    sessionEndRef.current = false;
    zoomTarget.current = 0;
    setFocusMomentT(null);
    setPeekUi(true);
  }, []);

  const releasePeek = useCallback(() => {
    if (!peekLatched.current) return;
    peekLatched.current = false;
    setPeekUi(false);
    if (focusRef.current !== null) zoomTarget.current = 1;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || focusRef.current === null) return;
      e.preventDefault();
      zoomOut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOut]);

  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const mouse = useRef({ x: 0, y: 0, in: 0 });
  const pull = useRef({ x: 0, y: 0, k: 0 });

  useEffect(() => {
    if (!person) return;
    let raf = 0;
    const tick = () => {
      const m = mouse.current;
      const p = pull.current;
      p.k += (m.in - p.k) * 0.1;
      p.x += (m.x - p.x) * 0.16;
      p.y += (m.y - p.y) * 0.16;

      const waveAt = (x: number) => {
        const lineY = layoutRef.current.lineY;
        const amp = Math.max(-6, Math.min(6, (m.y - lineY) * 0.28)) * p.k;
        const sigma2 = 2 * 95 * 95;
        return lineY + amp * Math.exp(-((x - p.x) * (x - p.x)) / sigma2);
      };

      const k = zoomK.current;
      const target = zoomTarget.current;
      const now = performance.now();

      if (target !== prevZoomTarget.current) {
        zoomAnim.current = {
          from: k,
          to: target,
          start: now,
          dur: target > k ? ZOOM_IN_MS : ZOOM_OUT_MS,
        };
        prevZoomTarget.current = target;
      }

      if (zoomAnim.current) {
        const { from, to, start, dur } = zoomAnim.current;
        const p = Math.min(1, (now - start) / dur);
        zoomK.current = from + (to - from) * easeInOutCubic(p);
        if (p >= 1) zoomAnim.current = null;
      } else {
        zoomK.current = target;
      }

      if (
        !zoomAnim.current &&
        Math.abs(zoomK.current - target) <= 0.002 &&
        target === 0 &&
        focusRef.current !== null &&
        sessionEndRef.current &&
        !peekLatched.current
      ) {
        setFocusStationIdx(null);
        setFocusMomentT(null);
        sessionEndRef.current = false;
      }

      const zk = zoomK.current;
      if (zk <= 0.02) morphK.current = 1;
      else if (morphK.current < 0.999) {
        morphK.current += (1 - morphK.current) * ZOOM_MORPH_SPEED;
      } else {
        morphK.current = 1;
      }
      const mk = morphK.current;
      const morphSnap = morphSnapshotRef.current;
      const isZoomed = zk > 0.02 && shownMode !== "element";

      const resolveZoom = (key: string, zxTo: number, zoTo: number) =>
        morphZoomTarget(key, zxTo, zoTo, mk, morphSnap);

      if (pathRef.current) {
        const pts: string[] = [];
        for (let x = PAD_X; x <= W - PAD_X + 0.1; x += 10)
          pts.push(`${x.toFixed(1)},${waveAt(x).toFixed(2)}`);
        pathRef.current.setAttribute("d", "M" + pts.join(" L"));
      }

      const svg = svgRef.current;
      const audio = player.state();

      if (svg) {
        svg.querySelectorAll<SVGElement>("[data-dot]").forEach((el) => {
          const track = el.dataset.track ?? "station";
          const morphKey = el.dataset.morphKey ?? "";
          const ox = Number(el.dataset.overviewX);
          const zxTo = Number(el.dataset.zoomX);
          const zoTo = Number(el.dataset.zoomOpacity ?? 1);
          const { zx, zo } = resolveZoom(morphKey, zxTo, zoTo);
          const useZoom = shownMode !== "element" && zk > 0.02;
          const x =
            useZoom && (track === "station" || track === "moment")
              ? lerpX(ox, zx, zk)
              : ox;
          const y = waveAt(x);
          el.setAttribute("cx", x.toFixed(2));
          el.setAttribute("cy", y.toFixed(2));
          let baseOp = 1;
          if (track === "station" && useZoom) baseOp = 1 - zk + zk * zo;
          if (track === "moment" && useZoom) baseOp = 1 - zk + zk * zo;
          if (track === "quote") baseOp = 0.85;
          if (el.dataset.halo !== undefined || el.dataset.ring !== undefined) {
            // halo/ring mantêm opacidade própria
          } else {
            el.setAttribute("opacity", baseOp.toFixed(3));
          }
        });

        svg.querySelectorAll<SVGTextElement>("[data-label]").forEach((el) => {
          const morphKey = el.dataset.morphKey ?? "";
          const ox = Number(el.dataset.overviewX);
          const zxTo = Number(el.dataset.zoomX);
          const zoTo = Number(el.dataset.zoomOpacity ?? 1);
          const { zx, zo } = resolveZoom(morphKey, zxTo, zoTo);
          const x = lerpX(ox, zx, zk);
          el.setAttribute("x", x.toFixed(2));
          el.setAttribute("y", String(layoutRef.current.labelY));
          el.setAttribute("opacity", (1 - zk + zk * zo).toFixed(3));
        });

        svg.querySelectorAll<SVGElement>("[data-tick]").forEach((el) => {
          const y = waveAt(Number(el.dataset.x));
          el.setAttribute("y1", (y - 3).toFixed(2));
          el.setAttribute("y2", (y + 3).toFixed(2));
        });

        svg.querySelectorAll<SVGElement>("[data-halo]").forEach((el) => {
          el.setAttribute(
            "opacity",
            (0.16 + 0.1 * Math.sin((now / 1000) * Math.PI * 2 * 1.1)).toFixed(3),
          );
        });

        const playhead = svg.querySelector<SVGLineElement>("[data-playhead]");
        const segment = svg.querySelector<SVGLineElement>("[data-segment]");
        const peeking = peekLatched.current;
        if (isZoomed && !peeking && audio?.playing && audio.duration > 0) {
          const px = PAD_X + audio.progress * (W - PAD_X * 2);
          const y = waveAt(px);
          if (playhead) {
            playhead.setAttribute("x1", PAD_X.toFixed(2));
            playhead.setAttribute("x2", px.toFixed(2));
            playhead.setAttribute("y1", y.toFixed(2));
            playhead.setAttribute("y2", y.toFixed(2));
            playhead.setAttribute("opacity", "0.9");
          }
          if (segment) {
            segment.setAttribute("x1", PAD_X.toFixed(2));
            segment.setAttribute("x2", (W - PAD_X).toFixed(2));
            segment.setAttribute("y1", y.toFixed(2));
            segment.setAttribute("y2", y.toFixed(2));
            segment.setAttribute("opacity", (0.25 * zk).toFixed(3));
          }
        } else {
          playhead?.setAttribute("opacity", "0");
          segment?.setAttribute("opacity", "0");
        }

        svg.querySelectorAll<SVGElement>("[data-ring]").forEach((el) => {
          const track = el.dataset.track ?? "station";
          const morphKey = el.dataset.morphKey ?? "";
          const ox = Number(el.dataset.overviewX);
          const zxTo = Number(el.dataset.zoomX);
          const { zx } = resolveZoom(morphKey, zxTo, 1);
          const useZoom = isZoomed && (track === "station" || track === "moment");
          const x = useZoom ? lerpX(ox, zx, zk) : ox;
          const y = waveAt(x);
          const c = Number(el.dataset.c);
          const prog =
            isZoomed && track === "station" && audio?.duration ? audio.progress : 0;
          el.setAttribute("stroke-dashoffset", (c * (1 - prog)).toFixed(2));
          el.setAttribute("transform", `rotate(-90 ${x} ${y.toFixed(2)})`);
          el.setAttribute("opacity", isZoomed && !peeking ? "0" : "0.85");
        });

        svg.querySelectorAll<SVGRectElement>("[data-edge-hint]").forEach((el) => {
          const side = el.dataset.edgeHint;
          const active =
            peeking &&
            side ===
              (mouse.current.x < PAD_X - layoutRef.current.stationHitR
                ? "left"
                : mouse.current.x > W - PAD_X + layoutRef.current.stationHitR
                  ? "right"
                  : "");
          el.setAttribute("opacity", (peeking ? (active ? 0.14 : 0.07) : 0).toFixed(3));
        });
      }

      if (import.meta.env.DEV) {
        const pl = useAudioIndex.getState().playing;
        (window as unknown as Record<string, unknown>).__limiarAudioBeat =
          audio && pl && audio.playing
            ? {
                personId: pl.personId,
                beatIndex: pl.beatIndex,
                file: pl.file,
                url: audio.url,
                t: audio.t,
                duration: audio.duration,
                progress: audio.progress,
                zoomK: zk,
                focusStation: focusRef.current,
                peek: peekLatched.current,
              }
            : null;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (import.meta.env.DEV)
        (window as unknown as Record<string, unknown>).__limiarAudioBeat = null;
    };
  }, [person, shownMode]);

  if (following === null || !person || !content) return null;

  const name = content.manifest.people[following]?.display_name ?? "";
  const elementLabel = elementLens
    ? (content.taxonomy.elementos.find((e) => e.key === elementLens)?.label ??
      elementLens)
    : null;

  const hoveredDot =
    hoverKey !== null ? dots.find((d) => d.key === hoverKey) : undefined;
  const focusedDot =
    focusStationIdx !== null
      ? dots.find((d) => d.track === "station" && d.stationIndex === focusStationIdx)
      : undefined;

  const showRuler = shownMode !== "element";
  const showQuotes = shownMode === "element";

  const isZoomUi =
    shownMode !== "element" && focusStationIdx !== null;
  const synopsis = person.summary?.one_liner?.trim() || null;
  const zoomChapterLabel =
    isZoomUi && !peekUi && focusedDot?.label ? focusedDot.label : null;

  const infoText = hoveredDot
    ? hoveredDot.info +
      (hoveredDot.cut === null && audioIndex !== null ? " · sem áudio ainda" : "")
    : hoverKey === "in" && person.arc.entrada
      ? person.arc.entrada.resumo
      : hoverKey === "out" && person.arc.saida
        ? person.arc.saida.resumo
        : peekUi
          ? "outros capítulos — clique para trocar"
          : focusedDot && focusStationIdx !== null
            ? focusedDot.info
            : activeBeat !== null
              ? (dots.find((d) => d.beatIndex === activeBeat)?.info ?? null)
              : synopsis;

  const onDotClick = (d: TimelineDot) => {
    if (d.beatIndex === null) return;

    if (d.track === "station" && d.stationIndex !== null) {
      const isPlayingThis =
        playing !== null && d.cut !== null && playing.url === d.cut.url;
      if (isPlayingThis && focusStationIdx === d.stationIndex) {
        if (peekUi || peekLatched.current) {
          peekLatched.current = false;
          setPeekUi(false);
          zoomTarget.current = 1;
          return;
        }
        zoomOut();
        return;
      }
      setPeekUi(false);
      peekLatched.current = false;
      playStation(d.stationIndex, d.beatIndex, d.cut);
      return;
    }

    const isPlayingThis =
      playing !== null && d.cut !== null && playing.url === d.cut.url;

    if (d.track === "moment" && shownMode !== "element" && person) {
      const beat = person.beats.find((b) => b.beat_index === d.beatIndex);
      if (!beat) return;

      const stations = computeStations(person);
      const stationIdx = chapterIndexForT(stations, beat.t_norm);
      const isZoomed = focusStationIdx !== null && !peekUi;
      const momentFocused =
        focusMomentT !== null &&
        Math.abs(focusMomentT - beat.t_norm) < 0.0001;

      if (isPlayingThis && isZoomed && momentFocused) {
        setFocusMomentT(null);
        return;
      }
      if (isPlayingThis && isZoomed) {
        void player.stop();
        setPlaying(null);
        setActiveBeat(null);
        return;
      }

      setFocusStationIdx(stationIdx);
      setFocusMomentT(beat.t_norm);
      setPeekUi(false);
      peekLatched.current = false;
      sessionEndRef.current = false;
      zoomTarget.current = 1;
      if (!isPlayingThis) playBeat(d.beatIndex, d.cut);
      return;
    }

    if (isPlayingThis) {
      void player.stop();
      setPlaying(null);
      setActiveBeat(null);
      return;
    }
    playBeat(d.beatIndex, d.cut);
  };

  const modeButton = (m: TimelineMode, label: string) => (
    <button
      key={m}
      onClick={() => setTl({ tlmode: m })}
      style={{
        all: "unset",
        cursor: "pointer",
        fontSize: 8.5,
        fontWeight: mode === m ? 400 : 300,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        maxWidth: 150,
        overflow: "hidden",
        textOverflow: "ellipsis",
        color:
          mode === m ? "rgba(235, 230, 222, 0.95)" : "rgba(201, 194, 184, 0.42)",
        textShadow: TEXT_SHADOW,
        transition: "color 0.25s ease",
      }}
    >
      {label}
    </button>
  );

  const navBtnStyle = {
    all: "unset" as const,
    cursor: "pointer",
    fontSize: 9,
    fontWeight: 300,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "rgba(207, 200, 190, 0.72)",
    textShadow: TEXT_SHADOW,
    pointerEvents: "auto" as const,
  };

  const headerTitle = zoomChapterLabel ?? name;
  const lineY = svgLayout.lineY;
  const labelY = svgLayout.labelY;
  const peekLeftW = PAD_X - svgLayout.stationHitR;
  const peekRightX = W - PAD_X + svgLayout.stationHitR;
  const peekRightW = W - peekRightX;
  const pxSvg = (n: number) => pxToSvg(n, svgClientWidth);

  return (
    <div
      ref={shellRef}
      style={{
        position: "fixed",
        left: "50%",
        bottom: tlBottom,
        transform: "translateX(-50%)",
        width: `clamp(${tlMin}px, ${tlVw}vw, ${tlMax}px)`,
        fontFamily: FONT_STACK,
        zIndex: 42,
        pointerEvents: "none",
        animation: "limiar-tl-fadein 0.5s ease",
      }}
    >
      <style>{`@keyframes limiar-tl-fadein { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

      <InfoLine text={infoText} fontSize={infoFontPx} />

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          padding: `0 ${(PAD_X / W) * 100}%`,
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
          {isZoomUi && (
            <button
              onClick={zoomOut}
              title="visão geral (ESC)"
              style={navBtnStyle}
            >
              ←
            </button>
          )}
          <div
            style={{
              fontSize: headerFontPx,
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "rgba(233, 228, 220, 0.85)",
              textShadow: TEXT_SHADOW,
            }}
          >
            {headerTitle}
            {!zoomChapterLabel && person.timeline_norm?.total_s
              ? ` · ${formatTime(person.timeline_norm.total_s)}`
              : ""}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            pointerEvents: "auto",
          }}
        >
          {isZoomUi && focusStationIdx !== null && (
            <>
              <button
                onClick={() => goStation(focusStationIdx - 1)}
                disabled={focusStationIdx <= 0}
                style={{
                  ...navBtnStyle,
                  opacity: focusStationIdx <= 0 ? 0.25 : 1,
                  cursor: focusStationIdx <= 0 ? "default" : "pointer",
                }}
                title="capítulo anterior"
              >
                ⏮
              </button>
              <button
                onClick={() => goStation(focusStationIdx + 1)}
                disabled={focusStationIdx >= stationCount - 1}
                style={{
                  ...navBtnStyle,
                  opacity: focusStationIdx >= stationCount - 1 ? 0.25 : 1,
                  cursor:
                    focusStationIdx >= stationCount - 1 ? "default" : "pointer",
                }}
                title="próximo capítulo"
              >
                ⏭
              </button>
            </>
          )}
          {elementLabel && modeButton("element", elementLabel)}
          {shownMode === "element" && (
            <button
              onClick={() => setTl({ tlmode: "stations" })}
              style={navBtnStyle}
              title="voltar à régua"
            >
              régua
            </button>
          )}
          <button
            onClick={() => toggleMuted()}
            title={muted ? "ativar o som" : "silenciar"}
            aria-label={muted ? "ativar o som" : "silenciar"}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              opacity: muted ? 0.42 : 0.75,
              transition: "opacity 0.25s ease",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z"
                fill="rgba(235, 230, 222, 0.9)"
              />
              {muted ? (
                <path
                  d="M16 9l5 6M21 9l-5 6"
                  stroke="rgba(235, 230, 222, 0.9)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M16 8.5a5 5 0 010 7M18.4 6.5a8 8 0 010 11"
                  stroke="rgba(235, 230, 222, 0.9)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          pointerEvents: "auto",
          filter: "drop-shadow(0 1px 5px rgba(0,0,0,0.55))",
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const mx = ((e.clientX - r.left) / r.width) * W;
          mouse.current.x = mx;
          mouse.current.y = ((e.clientY - r.top) / r.height) * H;
          mouse.current.in = 1;
        }}
        onMouseLeave={() => {
          mouse.current.in = 0;
          setHoverKey(null);
          releasePeek();
        }}
      >
        {person.arc.entrada && (
          <rect
            x={0}
            y={0}
            width={PAD_X + 8}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHoverKey("in")}
            onMouseLeave={() => setHoverKey((h) => (h === "in" ? null : h))}
          />
        )}
        {person.arc.saida && (
          <rect
            x={W - PAD_X - 8}
            y={0}
            width={PAD_X + 8}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHoverKey("out")}
            onMouseLeave={() => setHoverKey((h) => (h === "out" ? null : h))}
          />
        )}

        {isZoomUi && (
          <>
            <rect
              x={0}
              y={0}
              width={peekLeftW}
              height={H}
              fill="transparent"
              pointerEvents="all"
              onMouseEnter={armPeek}
            />
            <rect
              x={peekRightX}
              y={0}
              width={peekRightW}
              height={H}
              fill="transparent"
              pointerEvents="all"
              onMouseEnter={armPeek}
            />
            <rect
              data-edge-hint="left"
              x={0}
              y={0}
              width={peekLeftW}
              height={H}
              fill="rgba(235, 230, 222, 0.12)"
              opacity={0}
              pointerEvents="none"
            />
            <rect
              data-edge-hint="right"
              x={peekRightX}
              y={0}
              width={peekRightW}
              height={H}
              fill="rgba(235, 230, 222, 0.12)"
              opacity={0}
              pointerEvents="none"
            />
          </>
        )}

        <path
          ref={pathRef}
          d={`M${PAD_X},${lineY} L${W - PAD_X},${lineY}`}
          fill="none"
          stroke="rgba(233, 228, 220, 0.38)"
          strokeWidth="1"
        />

        <line
          data-segment
          x1={PAD_X}
          y1={lineY}
          x2={W - PAD_X}
          y2={lineY}
          stroke="rgba(235, 230, 222, 0.45)"
          strokeWidth={pxSvg(2.5)}
          strokeLinecap="round"
          opacity={0}
        />
        <line
          data-playhead
          x1={PAD_X}
          y1={lineY}
          x2={PAD_X}
          y2={lineY}
          stroke="rgba(235, 230, 222, 0.75)"
          strokeWidth={pxSvg(1.5)}
          strokeLinecap="round"
          opacity={0}
        />

        {showRuler && (
          <>
            <line
              data-tick
              data-x={PAD_X}
              x1={PAD_X}
              y1={lineY - pxSvg(3)}
              x2={PAD_X}
              y2={lineY + pxSvg(3)}
              stroke={
                hoverKey === "in"
                  ? "rgba(235, 230, 222, 0.8)"
                  : "rgba(233, 228, 220, 0.35)"
              }
              strokeWidth="1"
              style={{ transition: "stroke 0.25s ease" }}
            />
            <line
              data-tick
              data-x={W - PAD_X}
              x1={W - PAD_X}
              y1={lineY - pxSvg(3)}
              x2={W - PAD_X}
              y2={lineY + pxSvg(3)}
              stroke={
                hoverKey === "out"
                  ? "rgba(235, 230, 222, 0.8)"
                  : "rgba(233, 228, 220, 0.35)"
              }
              strokeWidth="1"
              style={{ transition: "stroke 0.25s ease" }}
            />
          </>
        )}

        <g
          style={{
            opacity: dotsVisible ? 1 : 0,
            transition: "opacity 0.18s ease",
          }}
        >
          {dots.map((d) => {
            if (d.r <= 0) return null;
            if (d.track !== "quote" && !showRuler) return null;
            if (d.track === "quote" && !showQuotes) return null;
            const baseOpacity = 1;
            const active =
              d.beatIndex !== null && activeBeat === d.beatIndex;
            const hovered = hoverKey === d.key;
            const isPlaying =
              playing !== null && d.cut !== null && playing.url === d.cut.url;
            const stR = svgLayout.stationDotR;
            const moR = svgLayout.momentDotR;
            const dotR =
              d.track === "station"
                ? active
                  ? stR + pxSvg(2)
                  : hovered
                    ? stR + pxSvg(1.2)
                    : stR
                : active
                  ? stR + pxSvg(1)
                  : hovered
                    ? stR
                    : moR;
            const hitR =
              d.track === "station" || hovered
                ? svgLayout.stationHitR
                : svgLayout.momentHitR;
            const ringR = dotR + pxSvg(3.6);
            const ringC = 2 * Math.PI * ringR;
            return (
              <g key={d.key}>
                {d.isVirada && d.track === "station" && (
                  <circle
                    data-dot
                    data-morph-key={d.key}
                    data-track={d.track}
                    data-overview-x={d.overviewX}
                    data-zoom-x={d.zoomX}
                    data-zoom-opacity={d.zoomOpacity}
                    data-base-opacity={baseOpacity}
                    cx={d.overviewX}
                    cy={lineY}
                    r={dotR + pxSvg(4)}
                    fill="none"
                    stroke="rgba(233, 228, 220, 0.55)"
                    strokeWidth={pxSvg(0.8)}
                  />
                )}
                {isPlaying && (
                  <circle
                    data-dot
                    data-halo
                    data-morph-key={d.key}
                    data-track={d.track}
                    data-overview-x={d.overviewX}
                    data-zoom-x={d.zoomX}
                    data-zoom-opacity={d.zoomOpacity}
                    data-base-opacity={baseOpacity}
                    cx={d.overviewX}
                    cy={lineY}
                    r={dotR + pxSvg(2.4)}
                    fill={d.color}
                    opacity={0.2}
                    pointerEvents="none"
                  />
                )}
                <circle
                  data-dot
                  data-morph-key={d.key}
                  data-track={d.track}
                  data-overview-x={d.overviewX}
                  data-zoom-x={d.zoomX}
                  data-zoom-opacity={d.zoomOpacity}
                  data-base-opacity={baseOpacity}
                  cx={d.overviewX}
                  cy={lineY}
                  r={dotR}
                  fill={d.color}
                  style={{ transition: "r 0.18s ease" }}
                />
                {isPlaying && d.track !== "station" && (
                  <circle
                    data-ring
                    data-morph-key={d.key}
                    data-track={d.track}
                    data-overview-x={d.overviewX}
                    data-zoom-x={d.zoomX}
                    data-c={ringC.toFixed(2)}
                    cx={d.overviewX}
                    cy={lineY}
                    r={ringR}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={pxSvg(1.1)}
                    strokeLinecap="round"
                    strokeDasharray={ringC.toFixed(2)}
                    strokeDashoffset={ringC.toFixed(2)}
                    transform={`rotate(-90 ${d.overviewX} ${lineY})`}
                    opacity={0.85}
                    pointerEvents="none"
                  />
                )}
                <circle
                  data-dot
                  data-morph-key={d.key}
                  data-track={d.track}
                  data-overview-x={d.overviewX}
                  data-zoom-x={d.zoomX}
                  data-zoom-opacity={d.zoomOpacity}
                  cx={d.overviewX}
                  cy={lineY}
                  r={hitR}
                  fill="transparent"
                  pointerEvents="all"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverKey(d.key)}
                  onMouseLeave={() =>
                    setHoverKey((h) => (h === d.key ? null : h))
                  }
                  onClick={() => onDotClick(d)}
                />
                {d.label && d.track === "station" && (
                  <text
                    data-label
                    data-morph-key={d.key}
                    data-overview-x={d.overviewX}
                    data-zoom-x={d.zoomX}
                    data-zoom-opacity={d.zoomOpacity}
                    x={d.overviewX}
                    y={labelY}
                    textAnchor="middle"
                    style={{
                      fontFamily: FONT_STACK,
                      fontSize: svgLayout.labelFont,
                      fontWeight: active || hovered ? 400 : 300,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fill:
                        active || hovered
                          ? "rgba(235, 230, 222, 0.95)"
                          : "rgba(207, 200, 190, 0.72)",
                      pointerEvents: "none",
                      transition: "fill 0.2s ease",
                    }}
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

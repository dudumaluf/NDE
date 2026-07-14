import { useEffect, useMemo, useRef, useState } from "react";
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
import { computeStations } from "./timelineStations";
import { prefStr } from "../lib/prefs";
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
 * Timeline da história (M4e; redesenhada 2026-07-14 com o feedback do Dudu:
 * "timeline com item demais espremido... quero algo mais clean... coisas
 * padronizadas entre as pessoas"). Aparece só no follow, bottom-center.
 *
 * Três decisões do redesign:
 *  1. ESTAÇÕES CANÔNICAS como default — a gramática comum entre as
 *     histórias (Antes · A morte · O outro lado · A virada · O retorno ·
 *     Depois), derivada de beats[].type + arc.virada em
 *     ui/timelineStations.ts. Pontos maiores, rótulo sempre visível,
 *     mesmos nomes/ordem para todo mundo (só as presentes aparecem).
 *  2. FILTRO DE CONSUMO — texto-botões minúsculos acima da linha (estética
 *     de rádio antigo): estações (default) · momentos (todos os beats,
 *     pontos pequenos sem rótulo) · o elemento da lente ativa no Campo
 *     (pontos = quotes com t_norm daquele elemento no JSON da pessoa).
 *     Default via pref ("Scene.tlmode"); ?tlmode=stations|all|element para
 *     screenshots. Trocar de modo = crossfade dos pontos.
 *  3. LAYOUT CLEAN — sem retângulo/painel: a linha flutua sobre a cena
 *     (~48% da largura) com sombra para legibilidade. Nome em caixa alta
 *     minúscula acima à esquerda; entrada/saída do arco viraram tooltips
 *     dos EXTREMOS da linha; resumo do ponto só no hover, numa linha acima
 *     com crossfade (padrão BottomPhrase da Legend).
 *
 * Mantidos: linha SVG com leve atração ao mouse (eco do menu cables, mais
 * sutil), pontos coloridos por valência (fria→quente), anel na virada.
 *
 * VOZ v1 (2026-07-14, doc 04 §4.2): clicar num ponto TOCA o corte real da
 * pessoa (estação/momento → corte do beat; ponto de elemento → corte da
 * quote, ou o do beat que a contém se a quote não subiu). Enquanto toca, o
 * ponto pulsa discretamente e ganha um ANEL DE PROGRESSO que se preenche
 * (SVG puro — nada de player chunky). Clicar de novo para; trocar de ponto
 * crossfada (player singleton, fades ~120 ms); ESC/sair do follow para o
 * áudio. Ponto sem corte no bucket = sem pulso + "sem áudio ainda" no hover
 * (estado vazio honesto, decidido pelo _index.json do bucket — ver
 * src/audio/cuts.ts). Mute minúsculo à direita dos modos.
 */

const FONT_STACK =
  '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

const W = 640;
const H = 70;
const PAD_X = 24;
const LINE_Y = 18;
/** Rótulos em até 3 linhas: estações coladas descem (nunca se sobrepõem). */
const LABEL_Y0 = 40;
const LABEL_ROW_DY = 11;
const LABEL_MAX_ROWS = 3;
/** Largura estimada por caractere (font 7.5px caixa alta + tracking 0.16em). */
const LABEL_CHAR_W = 5.4;

const TL_MODES = ["stations", "all", "element"] as const;
type TimelineMode = (typeof TL_MODES)[number];

/** Sombra dos textos HTML — a timeline flutua sem painel. */
const TEXT_SHADOW = "0 1px 12px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.45)";

/** Cor da valência −2..+2 → rampa fria→quente (nunca passa pelo verde). */
function valenceColor(v: number): string {
  return cssColor(demoRampColor((Math.max(-2, Math.min(2, v)) + 2) / 4));
}

/** Cor dos pontos do modo elemento — o creme "viveram isso" da Legend. */
const ELEMENT_DOT = "rgb(237, 222, 184)";

/** t_norm [0,1] → x no viewBox da linha. */
function xOf(t: number): number {
  return PAD_X + t * (W - PAD_X * 2);
}

/** Um ponto desenhável na linha, qualquer que seja o modo. */
interface TimelineDot {
  key: string;
  x: number;
  color: string;
  /** Raio base (estações são maiores que beats/quotes). */
  r: number;
  /** Rótulo sempre visível embaixo (só estações). */
  label: string | null;
  labelRow: number;
  isVirada: boolean;
  /** Texto da linha de info no hover. */
  info: string;
  /** beat_index selecionável no clique (quote usa o beat que a contém). */
  beatIndex: number | null;
  /** Corte de áudio deste ponto (null = "sem áudio ainda", honesto). */
  cut: Cut | null;
}

/** Linha acima da timeline: resumo no hover com crossfade (padrão Legend). */
function InfoLine({ text }: { text: string | null }) {
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
        fontSize: 12.5,
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
  const activeBeat = usePerson((s) => s.activeBeat);
  const elementLens = useLegend((s) => s.elementLens);
  const audioIndex = useAudioIndex((s) => s.index);
  const playing = useAudioIndex((s) => s.playing);
  const muted = useAudioIndex((s) => s.muted);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  // Modo do filtro: controle leva (grupo Scene, path estável p/ prefs) que os
  // texto-botões da própria timeline re-escrevem — uma fonte de verdade só.
  const [{ tlmode }, setTl] = useControls("Scene", () => ({
    tlmode: {
      value: prefStr<TimelineMode>("tlmode", "Scene.tlmode", "stations", TL_MODES),
      options: { stations: "stations", "all beats": "all", element: "element" },
      label: "timeline mode",
      hint: "what the story timeline plots: canonical stations, every beat, or the active element lens' quotes",
    },
  }));

  // Entrar/sair do follow carrega/limpa a pessoa (fetch com cache) — e o
  // áudio segue a mesma regra: trocar/sair de pessoa cala a voz (ESC solta o
  // follow no FollowCamera, o cleanup daqui faz o resto).
  useEffect(() => {
    if (following !== null && content) {
      const p = content.manifest.people[following];
      if (p) loadPerson(p.id);
      ensureAudioIndex();
      return () => {
        clearPerson();
        void player.stop();
        setPlaying(null);
      };
    }
  }, [following, content]);

  // Modo efetivo: "element" exige lente de elemento ativa no Campo.
  const mode: TimelineMode =
    tlmode === "element" && !elementLens ? "stations" : (tlmode as TimelineMode);

  // Crossfade na troca de modo: esvanece os pontos, troca, re-esvanece.
  const [shownMode, setShownMode] = useState<TimelineMode>(mode);
  const [dotsVisible, setDotsVisible] = useState(true);
  useEffect(() => {
    if (mode === shownMode) return;
    setDotsVisible(false);
    setHoverKey(null);
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

  const dots = useMemo<TimelineDot[]>(() => {
    if (!person) return [];

    if (shownMode === "stations") {
      // Linha do rótulo por LARGURA real estimada: cada rótulo desce para a
      // primeira linha onde não colide com o anterior (estações podem se
      // amontoar no início — ex.: morte aos 3% da entrevista).
      const rowRight: number[] = [];
      return computeStations(person).map((st) => {
        const e = emotion.get(st.beat.beat_index);
        const x = xOf(st.beat.t_norm);
        const half = (st.label.length * LABEL_CHAR_W) / 2;
        let labelRow = rowRight.findIndex((r) => x - half > r + 6);
        if (labelRow === -1) {
          labelRow =
            rowRight.length < LABEL_MAX_ROWS
              ? rowRight.length
              : rowRight.indexOf(Math.min(...rowRight));
        }
        rowRight[labelRow] = x + half;
        return {
          key: `st:${st.key}`,
          x,
          color: valenceColor(e?.valence ?? 0),
          r: 4.5,
          label: st.label,
          labelRow,
          isVirada: st.isVirada,
          info: (e?.label ? `${e.label} — ` : "") + st.beat.summary,
          beatIndex: st.beat.beat_index,
          cut: beatCut(person, st.beat.beat_index, audioIndex),
        };
      });
    }

    if (shownMode === "all") {
      return person.beats.map((b) => {
        const e = emotion.get(b.beat_index);
        return {
          key: `beat:${b.beat_index}`,
          x: xOf(b.t_norm),
          color: valenceColor(e?.valence ?? 0),
          r: 2.6,
          label: null,
          labelRow: 0,
          isVirada: person.arc.virada === b.beat_index,
          info: (e?.label ? `${e.label} — ` : "") + b.summary,
          beatIndex: b.beat_index,
          cut: beatCut(person, b.beat_index, audioIndex),
        };
      });
    }

    // "element": as quotes (com t_norm) do elemento da lente ativa nesta
    // história — os pontos onde AQUELE elemento acontece. Pessoa sem o
    // elemento = linha vazia (honesto: ela não conta sobre isso).
    // O índice ORIGINAL da quote (pré-ordenação) é o que casa com os
    // arquivos q_<key>_<i> do bucket — guardado antes do sort.
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
      return {
        key: `q:${i}`,
        x: xOf(q.t_norm),
        color: ELEMENT_DOT,
        r: 3.2,
        label: null,
        labelRow: 0,
        isVirada: false,
        info: `“${q.text}”`,
        beatIndex,
        cut: elementLens
          ? quoteCut(person, elementLens, qi, beatIndex, audioIndex)
          : null,
      };
    });
  }, [person, shownMode, elementLens, emotion, audioIndex]);

  // --- linha atraída pelo mouse (eco do menu cables), mais sutil que a v1 ---
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
      // easing: a linha persegue o mouse (entra) e relaxa reta (sai)
      p.k += (m.in - p.k) * 0.1;
      p.x += (m.x - p.x) * 0.16;
      p.y += (m.y - p.y) * 0.16;

      const amp = Math.max(-7, Math.min(7, (p.y - LINE_Y) * 0.3)) * p.k;
      const sigma2 = 2 * 95 * 95;
      const yAt = (x: number) =>
        LINE_Y + amp * Math.exp(-((x - p.x) * (x - p.x)) / sigma2);

      if (pathRef.current) {
        const pts: string[] = [];
        for (let x = PAD_X; x <= W - PAD_X + 0.1; x += 10)
          pts.push(`${x.toFixed(1)},${yAt(x).toFixed(2)}`);
        pathRef.current.setAttribute("d", "M" + pts.join(" L"));
      }
      const svg = svgRef.current;
      const now = performance.now();
      const audio = player.state();
      if (svg) {
        svg.querySelectorAll<SVGElement>("[data-dot]").forEach((el) => {
          const x = Number(el.dataset.x);
          el.setAttribute("cy", yAt(x).toFixed(2));
        });
        svg.querySelectorAll<SVGElement>("[data-tick]").forEach((el) => {
          const y = yAt(Number(el.dataset.x));
          el.setAttribute("y1", (y - 3).toFixed(2));
          el.setAttribute("y2", (y + 3).toFixed(2));
        });
        // Voz: pulso discreto (respiração de opacidade do halo) + anel de
        // progresso que se preenche — imperativos como a onda, zero re-render.
        svg.querySelectorAll<SVGElement>("[data-halo]").forEach((el) => {
          el.setAttribute(
            "opacity",
            (0.16 + 0.1 * Math.sin((now / 1000) * Math.PI * 2 * 1.1)).toFixed(3),
          );
        });
        svg.querySelectorAll<SVGElement>("[data-ring]").forEach((el) => {
          const x = Number(el.dataset.x);
          const y = yAt(x);
          const c = Number(el.dataset.c);
          const k = audio?.duration ? audio.progress : 0;
          el.setAttribute("stroke-dashoffset", (c * (1 - k)).toFixed(2));
          el.setAttribute("transform", `rotate(-90 ${x} ${y.toFixed(2)})`);
        });
      }
      // Gancho dev p/ o próximo marco (cair na morte) e a sonda headless:
      // o beat tocando agora + posição no corte.
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
              }
            : null;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Sair do follow desmonta o loop ANTES do stop() assíncrono terminar —
      // o gancho dev precisa zerar aqui, senão fica preso no último frame.
      if (import.meta.env.DEV)
        (window as unknown as Record<string, unknown>).__limiarAudioBeat = null;
    };
  }, [person]);

  if (following === null || !person || !content) return null;

  const name = content.manifest.people[following]?.display_name ?? "";
  const elementLabel = elementLens
    ? (content.taxonomy.elementos.find((e) => e.key === elementLens)?.label ??
      elementLens)
    : null;

  const hoveredDot =
    hoverKey !== null ? dots.find((d) => d.key === hoverKey) : undefined;
  const infoText = hoveredDot
    ? hoveredDot.info +
      (hoveredDot.cut === null && audioIndex !== null ? " · sem áudio ainda" : "")
    : hoverKey === "in" && person.arc.entrada
      ? person.arc.entrada.resumo
      : hoverKey === "out" && person.arc.saida
        ? person.arc.saida.resumo
        : activeBeat !== null
          ? (dots.find((d) => d.beatIndex === activeBeat)?.info ?? null)
          : null;

  // Clique = consumo (Voz v1): toca/para/troca o corte. A última chamada
  // vence dentro do player; aqui só decidimos a intenção.
  const onDotClick = (d: TimelineDot) => {
    if (d.beatIndex === null) return;
    const isPlayingThis = playing !== null && d.cut !== null && playing.url === d.cut.url;
    if (isPlayingThis) {
      void player.stop();
      setPlaying(null);
      setActiveBeat(null);
      return;
    }
    setActiveBeat(d.beatIndex);
    if (!d.cut) {
      // Sem corte no bucket: seleção visual apenas (e silêncio honesto).
      void player.stop();
      setPlaying(null);
      return;
    }
    const cut = d.cut;
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

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 26,
        transform: "translateX(-50%)",
        width: "clamp(400px, 48vw, 660px)",
        fontFamily: FONT_STACK,
        zIndex: 42,
        pointerEvents: "none",
        animation: "limiar-tl-fadein 0.5s ease",
      }}
    >
      <style>{`@keyframes limiar-tl-fadein { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

      {/* resumo do ponto (hover) — uma linha acima da timeline, crossfade */}
      <InfoLine text={infoText} />

      {/* acima da linha: nome à esquerda, filtro de consumo à direita */}
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
        <div
          style={{
            fontSize: 10,
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
          {name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            pointerEvents: "auto",
          }}
        >
          {modeButton("stations", "estações")}
          {modeButton("all", "momentos")}
          {elementLabel && modeButton("element", elementLabel)}
          {/* mute minúsculo (PT, discreto — a UI do visitante) */}
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

      {/* a linha (SVG) — flutua sem painel; sombra dá a legibilidade */}
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
          mouse.current.x = ((e.clientX - r.left) / r.width) * W;
          mouse.current.y = ((e.clientY - r.top) / r.height) * H;
          mouse.current.in = 1;
        }}
        onMouseLeave={() => {
          mouse.current.in = 0;
          setHoverKey(null);
        }}
      >
        {/* extremos: entrada/saída do arco sob demanda (tooltip, não mobília) */}
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

        <path
          ref={pathRef}
          d={`M${PAD_X},${LINE_Y} L${W - PAD_X},${LINE_Y}`}
          fill="none"
          stroke="rgba(233, 228, 220, 0.35)"
          strokeWidth="1"
        />
        {/* tiques dos extremos — a única pista de que ali mora algo */}
        <line
          data-tick
          data-x={PAD_X}
          x1={PAD_X}
          y1={LINE_Y - 3}
          x2={PAD_X}
          y2={LINE_Y + 3}
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
          y1={LINE_Y - 3}
          x2={W - PAD_X}
          y2={LINE_Y + 3}
          stroke={
            hoverKey === "out"
              ? "rgba(235, 230, 222, 0.8)"
              : "rgba(233, 228, 220, 0.35)"
          }
          strokeWidth="1"
          style={{ transition: "stroke 0.25s ease" }}
        />

        {/* os pontos do modo ativo (crossfade na troca) */}
        <g
          style={{
            opacity: dotsVisible ? 1 : 0,
            transition: "opacity 0.18s ease",
          }}
        >
          {dots.map((d) => {
            const active =
              d.beatIndex !== null && activeBeat === d.beatIndex;
            const hovered = hoverKey === d.key;
            const isPlaying =
              playing !== null && d.cut !== null && playing.url === d.cut.url;
            const ringR = d.r + 3.6;
            const ringC = 2 * Math.PI * ringR;
            return (
              <g key={d.key}>
                {d.isVirada && (
                  <circle
                    data-dot
                    data-x={d.x}
                    cx={d.x}
                    cy={LINE_Y}
                    r={d.r + 4}
                    fill="none"
                    stroke="rgba(233, 228, 220, 0.55)"
                    strokeWidth="0.8"
                  />
                )}
                {/* voz: halo que respira enquanto o corte toca */}
                {isPlaying && (
                  <circle
                    data-dot
                    data-halo
                    data-x={d.x}
                    cx={d.x}
                    cy={LINE_Y}
                    r={d.r + 2.4}
                    fill={d.color}
                    opacity={0.2}
                    pointerEvents="none"
                  />
                )}
                <circle
                  data-dot
                  data-x={d.x}
                  cx={d.x}
                  cy={LINE_Y}
                  r={active ? d.r + 2 : hovered ? d.r + 1.2 : d.r}
                  fill={d.color}
                  style={{ transition: "r 0.18s ease" }}
                />
                {/* voz: o ponto vira um anel que se preenche (progresso) */}
                {isPlaying && (
                  <circle
                    data-ring
                    data-x={d.x}
                    data-c={ringC.toFixed(2)}
                    cx={d.x}
                    cy={LINE_Y}
                    r={ringR}
                    fill="none"
                    stroke={d.color}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeDasharray={ringC.toFixed(2)}
                    strokeDashoffset={ringC.toFixed(2)}
                    transform={`rotate(-90 ${d.x} ${LINE_Y})`}
                    opacity={0.85}
                    pointerEvents="none"
                  />
                )}
                {/* alvo de clique generoso (o ponto é pequeno) */}
                <circle
                  data-dot
                  data-x={d.x}
                  data-dot-click={d.key}
                  cx={d.x}
                  cy={LINE_Y}
                  r={10}
                  fill="transparent"
                  pointerEvents="all"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverKey(d.key)}
                  onMouseLeave={() =>
                    setHoverKey((h) => (h === d.key ? null : h))
                  }
                  onClick={() => onDotClick(d)}
                />
                {d.label && (
                  <text
                    x={d.x}
                    y={LABEL_Y0 + d.labelRow * LABEL_ROW_DY}
                    textAnchor="middle"
                    style={{
                      fontFamily: FONT_STACK,
                      fontSize: active || hovered ? 8.5 : 7.5,
                      fontWeight: active ? 400 : 300,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fill:
                        active || hovered
                          ? "rgba(235, 230, 222, 0.95)"
                          : "rgba(207, 200, 190, 0.62)",
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

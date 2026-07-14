import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../data/contentStore";
import {
  clearPerson,
  loadPerson,
  setActiveBeat,
  usePerson,
  type PersonBeat,
} from "../data/personStore";
import { useFollow } from "./followStore";
import { cssColor, demoRampColor } from "../data/palette";

/**
 * Timeline da história (M4e, doc 04 §4.1): aparece ao entrar em follow —
 * a linha do tempo da entrevista da pessoa seguida, bottom-center, irmã
 * estética da Legend (mesma fonte, fundo translúcido, caixa alta discreta).
 *
 * Referência visual: o menu do patch cables do Dudu
 * (public/examples_code/Menu_Timeline): linha horizontal com pontos, labels
 * pequenos embaixo, item ativo grande, e a LINHA levemente atraída pelo
 * mouse (SVG puro — custo zero de WebGL; o path é re-desenhado num rAF só
 * enquanto a timeline está montada).
 *
 * Pontos em `t_norm` coloridos por valência (−2 frio → +2 quente, rampa do
 * demoRampColor — a mesma família das lentes ordinais); anel discreto na
 * `virada` do arco. Hover = resumo do beat + rótulo emocional numa linha
 * acima (crossfade). Clique = seleciona (activeBeat no personStore) — v1 é
 * VISUAL; tocar o áudio do corte é a próxima etapa (doc 04 §4.1).
 */

const FONT_STACK =
  '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

const W = 640;
const H = 74;
const PAD_X = 18;
const LINE_Y = 30;
const LABEL_Y = 52;

/** Cor da valência −2..+2 → rampa fria→quente (nunca passa pelo verde). */
function valenceColor(v: number): string {
  return cssColor(demoRampColor((Math.max(-2, Math.min(2, v)) + 2) / 4));
}

interface TimelineBeat {
  beat: PersonBeat;
  x: number;
  valence: number;
  emotionLabel: string | null;
  isVirada: boolean;
  /** Linha do label (0/1): beats colados alternam para não sobrepor. */
  labelRow: number;
}

/** Linha acima da timeline: resumo do beat com crossfade (padrão da Legend). */
function BeatInfo({ text }: { text: string | null }) {
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
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, shown]);

  return (
    <div
      style={{
        minHeight: 38,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 18px 8px",
        fontSize: 12.5,
        fontWeight: 300,
        letterSpacing: "0.04em",
        lineHeight: 1.45,
        color: "rgba(235, 230, 222, 0.9)",
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 4}px)`,
        transition: "opacity 0.22s ease, transform 0.22s ease",
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
  const [hoverBeat, setHoverBeat] = useState<number | null>(null);

  // Entrar/sair do follow carrega/limpa a pessoa (fetch com cache).
  useEffect(() => {
    if (following !== null && content) {
      const p = content.manifest.people[following];
      if (p) loadPerson(p.id);
      return () => clearPerson();
    }
  }, [following, content]);

  const beats = useMemo<TimelineBeat[]>(() => {
    if (!person) return [];
    const emotion = new Map(
      person.arc.beats_emotion.map((e) => [e.beat_index, e]),
    );
    let prevX = -1e9;
    let prevRow = 0;
    return person.beats.map((b) => {
      const e = emotion.get(b.beat_index);
      const x = PAD_X + b.t_norm * (W - PAD_X * 2);
      // labels de beats colados (<72 px) alternam de linha
      const labelRow = x - prevX < 72 ? 1 - prevRow : 0;
      prevX = x;
      prevRow = labelRow;
      return {
        beat: b,
        x,
        valence: e?.valence ?? 0,
        emotionLabel: e?.label ?? null,
        isVirada: person.arc.virada === b.beat_index,
        labelRow,
      };
    });
  }, [person]);

  // --- linha atraída pelo mouse: path + pontos re-desenhados num rAF ---
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
      p.k += (m.in - p.k) * 0.12;
      p.x += (m.x - p.x) * 0.18;
      p.y += (m.y - p.y) * 0.18;

      const amp = Math.max(-13, Math.min(13, (p.y - LINE_Y) * 0.45)) * p.k;
      const sigma2 = 2 * 85 * 85;
      const yAt = (x: number) =>
        LINE_Y + amp * Math.exp(-((x - p.x) * (x - p.x)) / sigma2);

      if (pathRef.current) {
        const pts: string[] = [];
        for (let x = PAD_X; x <= W - PAD_X + 0.1; x += 10)
          pts.push(`${x.toFixed(1)},${yAt(x).toFixed(2)}`);
        pathRef.current.setAttribute("d", "M" + pts.join(" L"));
      }
      const svg = svgRef.current;
      if (svg) {
        svg.querySelectorAll<SVGElement>("[data-dot]").forEach((el) => {
          const x = Number(el.dataset.x);
          el.setAttribute("cy", yAt(x).toFixed(2));
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [person]);

  if (following === null || !person || !content) return null;

  const name = content.manifest.people[following]?.display_name ?? "";
  // Histórias curtas (≤8 beats) mostram todos os labels como o menu cables;
  // longas (20+) só ativo/hover — senão os labels viram mancha ilegível.
  const showAllLabels = beats.length <= 8;
  const infoBeat =
    hoverBeat !== null
      ? beats.find((b) => b.beat.beat_index === hoverBeat)
      : activeBeat !== null
        ? beats.find((b) => b.beat.beat_index === activeBeat)
        : null;
  const infoText = infoBeat
    ? (infoBeat.emotionLabel ? `${infoBeat.emotionLabel} — ` : "") +
      infoBeat.beat.summary
    : null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 30,
        transform: "translateX(-50%)",
        width: "min(920px, 92vw)",
        display: "flex",
        alignItems: "flex-end",
        gap: 18,
        padding: "12px 20px 10px",
        borderRadius: 12,
        background: "rgba(22, 21, 20, 0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255, 252, 245, 0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
        fontFamily: FONT_STACK,
        zIndex: 42,
        animation: "limiar-fadein 0.5s ease",
      }}
    >
      <style>{`@keyframes limiar-fadein { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

      {/* título à esquerda: nome + entrada/saída do arco */}
      <div style={{ width: 210, flexShrink: 0, paddingBottom: 6 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(233, 228, 220, 0.88)",
            lineHeight: 1.5,
            marginBottom: 6,
          }}
        >
          {name}
        </div>
        {person.arc.entrada && (
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 300,
              letterSpacing: "0.03em",
              lineHeight: 1.45,
              color: "rgba(201, 194, 184, 0.6)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {person.arc.entrada.resumo}
          </div>
        )}
        {person.arc.saida && (
          <div
            style={{
              marginTop: 4,
              fontSize: 10.5,
              fontWeight: 300,
              letterSpacing: "0.03em",
              lineHeight: 1.45,
              color: "rgba(214, 205, 190, 0.74)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {person.arc.saida.resumo}
          </div>
        )}
      </div>

      {/* a linha do tempo (SVG) com o resumo do beat por cima */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <BeatInfo text={infoText} />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block" }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mouse.current.x = ((e.clientX - r.left) / r.width) * W;
            mouse.current.y = ((e.clientY - r.top) / r.height) * H;
            mouse.current.in = 1;
          }}
          onMouseLeave={() => {
            mouse.current.in = 0;
            setHoverBeat(null);
          }}
        >
          <path
            ref={pathRef}
            d={`M${PAD_X},${LINE_Y} L${W - PAD_X},${LINE_Y}`}
            fill="none"
            stroke="rgba(233, 228, 220, 0.34)"
            strokeWidth="1"
          />
          {beats.map((b) => {
            const active = activeBeat === b.beat.beat_index;
            const hovered = hoverBeat === b.beat.beat_index;
            const color = valenceColor(b.valence);
            return (
              <g key={b.beat.beat_index}>
                {b.isVirada && (
                  <circle
                    data-dot
                    data-x={b.x}
                    cx={b.x}
                    cy={LINE_Y}
                    r={7.5}
                    fill="none"
                    stroke="rgba(233, 228, 220, 0.55)"
                    strokeWidth="0.8"
                  />
                )}
                <circle
                  data-dot
                  data-x={b.x}
                  cx={b.x}
                  cy={LINE_Y}
                  r={active ? 5.5 : hovered ? 4.5 : 3}
                  fill={color}
                  style={{ transition: "r 0.18s ease" }}
                />
                {/* alvo de clique generoso (o ponto é pequeno) */}
                <circle
                  data-dot
                  data-x={b.x}
                  cx={b.x}
                  cy={LINE_Y}
                  r={13}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverBeat(b.beat.beat_index)}
                  onMouseLeave={() =>
                    setHoverBeat((h) => (h === b.beat.beat_index ? null : h))
                  }
                  onClick={() =>
                    setActiveBeat(
                      activeBeat === b.beat.beat_index
                        ? null
                        : b.beat.beat_index,
                    )
                  }
                />
                {(showAllLabels || active || hovered) && (
                  <text
                    x={b.x}
                    y={LABEL_Y + (showAllLabels ? b.labelRow * 11 : 0)}
                    textAnchor="middle"
                    style={{
                      fontFamily: FONT_STACK,
                      fontSize: active ? 9.5 : hovered ? 8.5 : 7.5,
                      fontWeight: active ? 400 : 300,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fill:
                        active || hovered
                          ? "rgba(235, 230, 222, 0.92)"
                          : "rgba(201, 194, 184, 0.5)",
                      pointerEvents: "none",
                    }}
                  >
                    {b.beat.type}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../data/contentStore";
import { useDemoLens } from "../data/demoLensStore";
import { clusterColor, cssColor, desaturate } from "../data/palette";
import { triggerLegendFlash, useLegend, type LegendFlash } from "./legendStore";

/**
 * Legenda da experiência (M3.5) — a primeira peça da UI REAL do LIMIAR,
 * fora do leva. Canto inferior direito: chips com bolinha de cor + label +
 * contagem do que está em cena AGORA:
 *   lente demográfica ativa → categorias · lente de elemento → tem/não tem
 *   · sem lente → os 12 núcleos · sem content → não renderiza nada.
 *
 * Estética-semente da identidade visual (doc 01: cinzas quentes, cor como
 * dado): fundo translúcido escuro, caixa alta discreta no título, tracking
 * generoso, peso leve, transições de fade/slide — nada de cara de debug.
 *
 * Clicar num chip destaca o grupo por ~2 s (dessatura os demais — via
 * legendStore → CrowdMesh re-escreve o iColorScale, barato).
 *
 * A "frase do bottom" (pedido do Dudu): frase_visitante da lente ativa
 * (elemento ou demográfica, vindas do taxonomy.json) numa linha discreta na
 * base, com fade na troca.
 */

const FONT_STACK =
  '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

interface Chip {
  key: string;
  label: string;
  count: number;
  color: [number, number, number];
  flash: LegendFlash;
  muted?: boolean;
}

/** Título + chips do que está em cena agora (null = legenda oculta). */
function useLegendModel(): { title: string; chips: Chip[]; phrase: string | null } | null {
  const content = useContent((s) => s.content);
  const demoCls = useDemoLens((s) => s.cls);
  const elementLens = useLegend((s) => s.elementLens);

  return useMemo(() => {
    if (!content) return null;
    const people = content.manifest.people;

    if (demoCls) {
      const meta = content.taxonomy.lentes_demograficas?.find(
        (l) => l.key === demoCls.lens,
      );
      return {
        title: meta?.label ?? demoCls.lens,
        chips: demoCls.categories
          .map((cat, i) => ({
            key: cat.key,
            label: cat.label,
            count: cat.count,
            color: cat.color,
            flash: { kind: "demo", id: String(i) } as LegendFlash,
            muted: cat.nd,
          }))
          .filter((c) => c.count > 0),
        phrase: meta?.frase_visitante ?? null,
      };
    }

    if (elementLens) {
      const el = content.taxonomy.elementos.find((e) => e.key === elementLens);
      const has = people.filter((p) => p.elements.includes(elementLens)).length;
      return {
        title: el?.label ?? elementLens,
        chips: [
          {
            key: "has",
            label: "viveram isso",
            count: has,
            color: [0.93, 0.87, 0.72] as [number, number, number],
            flash: { kind: "side", id: "has" } as LegendFlash,
          },
          {
            key: "not",
            label: "os demais",
            count: people.length - has,
            color: [0.45, 0.44, 0.43] as [number, number, number],
            flash: { kind: "side", id: "not" } as LegendFlash,
            muted: true,
          },
        ],
        phrase: el?.frase_visitante ?? null,
      };
    }

    return {
      title: "Núcleos",
      chips: content.clusters
        .filter((cl) => cl.size > 0)
        .map((cl) => ({
          key: String(cl.id),
          label: cl.label,
          count: cl.size,
          color: desaturate(clusterColor(cl.id), 0.15),
          flash: { kind: "cluster", id: String(cl.id) } as LegendFlash,
        })),
      phrase: null,
    };
  }, [content, demoCls, elementLens]);
}

/** Frase do bottom com crossfade: troca de texto = fade-out → swap → fade-in. */
function BottomPhrase({ phrase }: { phrase: string | null }) {
  const [shown, setShown] = useState(phrase);
  const [visible, setVisible] = useState(Boolean(phrase));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phrase === shown) {
      setVisible(Boolean(phrase));
      return;
    }
    setVisible(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(phrase);
      setVisible(Boolean(phrase));
    }, 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phrase, shown]);

  if (!shown) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 34,
        transform: `translateX(-50%) translateY(${visible ? 0 : 6}px)`,
        maxWidth: "min(680px, 78vw)",
        textAlign: "center",
        fontFamily: FONT_STACK,
        fontSize: 14.5,
        fontWeight: 300,
        letterSpacing: "0.045em",
        lineHeight: 1.55,
        color: "rgba(233, 228, 220, 0.92)",
        textShadow: "0 1px 14px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.4)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease, transform 0.45s ease",
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      {shown}
    </div>
  );
}

export function Legend() {
  const model = useLegendModel();
  const flash = useLegend((s) => s.flash);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (!model) return null;
  const activeFlashKey = flash ? `${flash.kind}:${flash.id}` : null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 44,
          width: 228,
          maxHeight: "52vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          padding: "16px 16px 13px",
          borderRadius: 10,
          background: "rgba(22, 21, 20, 0.62)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 252, 245, 0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
          fontFamily: FONT_STACK,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(201, 194, 184, 0.78)",
            marginBottom: 11,
          }}
        >
          {model.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {model.chips.map((chip) => {
            const isFlashed =
              activeFlashKey === `${chip.flash.kind}:${chip.flash.id}`;
            return (
              <button
                key={chip.key}
                onClick={() => triggerLegendFlash(chip.flash)}
                title="destacar no Campo"
                style={{
                  all: "unset",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 9,
                  cursor: "pointer",
                  padding: "2px 4px",
                  margin: "-2px -4px",
                  borderRadius: 5,
                  background: isFlashed ? "rgba(255,250,240,0.07)" : "transparent",
                  transition: "background 0.3s ease, opacity 0.3s ease",
                  opacity: flash && !isFlashed ? 0.45 : 1,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: cssColor(chip.color),
                    boxShadow: isFlashed
                      ? `0 0 7px 1px ${cssColor(chip.color)}`
                      : "none",
                    transform: "translateY(-1px)",
                    transition: "box-shadow 0.3s ease",
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 300,
                    letterSpacing: "0.035em",
                    lineHeight: 1.35,
                    color: chip.muted
                      ? "rgba(200, 194, 185, 0.55)"
                      : "rgba(235, 230, 222, 0.92)",
                  }}
                >
                  {chip.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    fontVariantNumeric: "tabular-nums",
                    color: "rgba(190, 183, 172, 0.6)",
                  }}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <BottomPhrase phrase={model.phrase} />
    </>
  );
}

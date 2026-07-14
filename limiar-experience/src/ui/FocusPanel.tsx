import { useEffect, useMemo, useState } from "react";
import { useContent } from "../data/contentStore";
import { clusterColor, cssColor, desaturate } from "../data/palette";
import { clusterSignature } from "../data/clusterSignature";
import { useFocus, focusSubElement, clearFocus } from "../scene/focusStore";

/**
 * Painel de FOCO do núcleo (2026-07-14): irmão da Legend (mesmo design
 * system, PT), aparece quando um núcleo entra em foco (clique num rótulo 3D
 * ou no ⌖ de um chip da Legend). Mostra:
 *   - nome do núcleo + nº de pessoas;
 *   - a ASSINATURA: os ~6 elementos que mais DISTINGUEM o núcleo (ranking por
 *     lift — % dentre os membros vs % no corpus), como CHIPS CLICÁVEIS.
 *
 * Clicar num chip = sublente v1 (interseção): destaca só os membros do núcleo
 * que têm aquele elemento (legendStore flash "clusterElement"). Re-clicar
 * volta ao núcleo inteiro. × / ESC / clique no vazio saem do foco.
 */

const FONT_STACK =
  '"Inter", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

export function FocusPanel() {
  const content = useContent((s) => s.content);
  const cluster = useFocus((s) => s.cluster);
  const subElement = useFocus((s) => s.subElement);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(cluster !== null);
  }, [cluster]);

  const model = useMemo(() => {
    if (!content || cluster === null) return null;
    const cl = content.clusters.find((c) => c.id === cluster);
    if (!cl) return null;
    return {
      label: cl.label,
      size: cl.size,
      color: desaturate(clusterColor(cl.id), 0.1),
      signature: clusterSignature(content, cluster, 6),
    };
  }, [content, cluster]);

  if (!model) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 18,
        top: "50%",
        transform: `translateY(-50%) translateX(${mounted ? 0 : -12}px)`,
        width: 246,
        maxHeight: "72vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        padding: "17px 17px 15px",
        borderRadius: 11,
        background: "rgba(22, 21, 20, 0.66)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 252, 245, 0.08)",
        boxShadow: "0 10px 38px rgba(0,0,0,0.34)",
        fontFamily: FONT_STACK,
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.5s ease, transform 0.5s ease",
        zIndex: 45,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
        <span
          style={{
            flexShrink: 0,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: cssColor(model.color),
            boxShadow: `0 0 9px 1px ${cssColor(model.color)}`,
            transform: "translateY(4px)",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 400,
              letterSpacing: "0.01em",
              lineHeight: 1.25,
              color: "rgba(238, 233, 225, 0.96)",
            }}
          >
            {model.label}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "rgba(190, 183, 172, 0.72)",
              marginTop: 3,
            }}
          >
            {model.size} {model.size === 1 ? "pessoa" : "pessoas"} · núcleo
          </div>
        </div>
        <button
          onClick={() => clearFocus()}
          title="sair do foco (Esc)"
          style={{
            all: "unset",
            cursor: "pointer",
            fontSize: 15,
            lineHeight: 1,
            color: "rgba(200, 194, 185, 0.6)",
            padding: "2px 4px",
            transform: "translateY(-2px)",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(201, 194, 184, 0.66)",
          margin: "15px 0 9px",
        }}
      >
        Assinatura
      </div>

      {model.signature.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            fontWeight: 300,
            color: "rgba(190, 183, 172, 0.6)",
            lineHeight: 1.5,
          }}
        >
          núcleo pequeno demais para uma assinatura estável
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {model.signature.map((el) => {
            const on = subElement === el.key;
            return (
              <button
                key={el.key}
                onClick={() => focusSubElement(el.key)}
                title={`${Math.round(el.clusterPct * 100)}% deste núcleo · ${el.lift.toFixed(1)}× o corpus`}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  padding: "5px 9px",
                  borderRadius: 7,
                  background: on
                    ? "rgba(255, 250, 240, 0.14)"
                    : "rgba(255, 250, 240, 0.05)",
                  border: on
                    ? "1px solid rgba(255,250,240,0.28)"
                    : "1px solid rgba(255,250,240,0.06)",
                  transition: "background 0.25s ease, border 0.25s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                    color: on
                      ? "rgba(245, 240, 232, 0.98)"
                      : "rgba(226, 220, 211, 0.9)",
                  }}
                >
                  {el.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    fontVariantNumeric: "tabular-nums",
                    color: "rgba(190, 183, 172, 0.62)",
                  }}
                >
                  {el.lift >= 10 ? el.lift.toFixed(0) : el.lift.toFixed(1)}×
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        style={{
          fontSize: 10.5,
          fontWeight: 300,
          letterSpacing: "0.02em",
          lineHeight: 1.5,
          color: "rgba(180, 174, 164, 0.62)",
          marginTop: 13,
        }}
      >
        {subElement
          ? "destacando quem, neste núcleo, viveu esse elemento"
          : "toque um elemento para isolar quem o viveu"}
      </div>
    </div>
  );
}

import { useState } from "react";
import { button, useControls } from "leva";
import { vatPlayer } from "../vat/VatClipPlayer";
import { vat, vatB } from "../vat/runtime";
import { cancelStoryArc, playStoryArc } from "../vat/storyArc";
import { pref } from "../lib/prefs";

/**
 * Botões de estado narrativo (doc 01 §4). Cada clique morfa a animação
 * atual na escolhida — em qualquer ordem, sem pop. Vale para o personagem
 * e para a multidão inteira (ambos leem o mesmo player neste protótipo).
 * Os botões vêm do descriptor ativo (?vat= troca clipes junto).
 *
 * Com `?vatB=<nome>` (segunda VAT da mesma malha), aparece o dropdown
 * "textura": os botões passam a listar os clipes da VAT escolhida e o
 * clique morfa PARA ela — crossfade entre texturas, mesma mecânica.
 */
export function StateButtons() {
  const b = vatB();
  const vatNames = b ? [vat().name, b.name] : [vat().name];
  const [texSel, setTexSel] = useState(vatNames[0]);

  const selected = b && texSel === b.name ? b : vat();
  const clipButtons = Object.fromEntries(
    selected.clips.map((clip, i) => [
      `${i} · ${clip.name}${clip.loop ? "" : " (one-shot)"}`,
      button(() => vatPlayer.play(i, { vat: selected.name })),
    ]),
  );

  useControls(
    "Estados (morph seamless)",
    {
      ...(b
        ? {
            textura: {
              value: texSel,
              options: vatNames,
              label: "textura (VAT)",
              onChange: (v: string) => setTexSel(v),
            },
          }
        : {}),
      ...clipButtons,
      ...(b
        ? {
            "morph A ⇄ B": button(() => {
              // teste de 1 clique: alterna entre o 1º clipe de cada textura
              const other = vatPlayer.currentClip >= vat().clipCount ? vat().name : b.name;
              vatPlayer.play(0, { vat: other });
            }),
          }
        : {}),
      ...(vat().clipCount >= 6
        ? { "arco da história": button(() => playStoryArc(vatPlayer)) }
        : {}),
      parar: button(() => {
        cancelStoryArc();
        vatPlayer.play(0);
      }),
      fade: {
        value: pref("Estados (morph seamless).fade", 0.35),
        min: 0,
        max: 1.5,
        label: "fade (s)",
        onChange: (v: number) => {
          vatPlayer.defaultFade = v;
        },
      },
      velocidade: {
        value: pref("Estados (morph seamless).velocidade", 1),
        min: 0,
        max: 3,
        onChange: (v: number) => {
          vatPlayer.speed = v;
        },
      },
    },
    [texSel],
  );
  return null;
}

import { button, useControls } from "leva";
import { vatPlayer } from "../vat/VatClipPlayer";
import { cancelStoryArc, playStoryArc } from "../vat/storyArc";

/**
 * Botões de estado narrativo (doc 01 §4). Cada clique morfa a animação
 * atual na escolhida — em qualquer ordem, sem pop. Vale para o personagem
 * e para a multidão inteira (ambos leem o mesmo player neste protótipo).
 */
export function StateButtons() {
  useControls("Estados (morph seamless)", {
    "0 · idle": button(() => vatPlayer.play(0)),
    "1 · andar": button(() => vatPlayer.play(1)),
    "2 · idle var.": button(() => vatPlayer.play(2)),
    "3 · morrer": button(() => vatPlayer.play(3)),
    "4 · levantar": button(() => vatPlayer.play(4)),
    "5 · rezar": button(() => vatPlayer.play(5)),
    "arco da história": button(() => playStoryArc(vatPlayer)),
    parar: button(() => {
      cancelStoryArc();
      vatPlayer.play(0);
    }),
    fade: {
      value: 0.35,
      min: 0,
      max: 1.5,
      label: "fade (s)",
      onChange: (v: number) => {
        vatPlayer.defaultFade = v;
      },
    },
    velocidade: {
      value: 1,
      min: 0,
      max: 3,
      onChange: (v: number) => {
        vatPlayer.speed = v;
      },
    },
  });
  return null;
}

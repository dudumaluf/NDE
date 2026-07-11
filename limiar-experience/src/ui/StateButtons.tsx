import { button, useControls } from "leva";
import { vatPlayer } from "../vat/VatClipPlayer";
import { vat } from "../vat/runtime";
import { cancelStoryArc, playStoryArc } from "../vat/storyArc";

/**
 * Botões de estado narrativo (doc 01 §4). Cada clique morfa a animação
 * atual na escolhida — em qualquer ordem, sem pop. Vale para o personagem
 * e para a multidão inteira (ambos leem o mesmo player neste protótipo).
 * Os botões vêm do descriptor ativo (?vat= troca clipes junto).
 */
export function StateButtons() {
  const clipButtons = Object.fromEntries(
    vat().clips.map((clip, i) => [
      `${i} · ${clip.name}${clip.loop ? "" : " (one-shot)"}`,
      button(() => vatPlayer.play(i)),
    ]),
  );
  useControls("Estados (morph seamless)", {
    ...clipButtons,
    ...(vat().clipCount >= 6
      ? { "arco da história": button(() => playStoryArc(vatPlayer)) }
      : {}),
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

import { clipInfo, totalClipCount } from "./runtime";

/**
 * Papéis funcionais dos clipes para a máquina de estados da multidão
 * (doc 04 §5.5): quem é "idle", quem é "andar", quem é "rezar" — detectado
 * por NOME (pt/en) no descriptor ativo (?vat= e ?vatB= entram com índice
 * global), com fallbacks seguros para qualquer VAT.
 *
 * O slot `run` fica PREPARADO para o clipe de corrida futuro do VAT Studio:
 * se existir um clipe /corr|run/ ele é usado no estado "correndo" e o boost
 * de playback do walk é dispensado; sem ele, correndo = walk acelerado
 * (`hasRunClip` avisa a sim).
 */
export interface ClipRoles {
  idle: number;
  /** Variação de idle (legado: clipe 2 "idle var.") — textura da multidão. */
  idle2: number;
  walk: number;
  /** Clipe do estado "correndo" (= walk enquanto não houver clipe próprio). */
  run: number;
  rezar: number;
  hasRunClip: boolean;
}

export function detectClipRoles(): ClipRoles {
  const clips: { i: number; name: string; loop: boolean }[] = [];
  for (let i = 0; i < totalClipCount(); i++) {
    const c = clipInfo(i);
    if (c) clips.push({ i, name: c.name.toLowerCase(), loop: c.loop });
  }

  const find = (re: RegExp, nth = 0): number => {
    let seen = 0;
    for (const c of clips) {
      if (re.test(c.name)) {
        if (seen === nth) return c.i;
        seen += 1;
      }
    }
    return -1;
  };
  const firstLoop = clips.find((c) => c.loop)?.i ?? 0;

  const idle = ((v) => (v >= 0 ? v : firstLoop))(find(/idle|parad/));
  const idle2 = ((v) => (v >= 0 ? v : idle))(find(/idle|parad/, 1));
  const walk = ((v) => (v >= 0 ? v : idle))(find(/andar|walk|caminh/));
  const runIdx = find(/corr|run/);
  const rezar = ((v) => (v >= 0 ? v : idle))(find(/rez|pray|ajoelh|kneel/));

  return {
    idle,
    idle2,
    walk,
    run: runIdx >= 0 ? runIdx : walk,
    rezar,
    hasRunClip: runIdx >= 0,
  };
}

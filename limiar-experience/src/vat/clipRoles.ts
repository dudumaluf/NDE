import { clipInfo, totalClipCount } from "./runtime";

/**
 * Papéis funcionais dos clipes para a máquina de estados da multidão
 * (doc 04 §5.5, doc 06): quem é "idle", quem é "andar", quem é "rezar".
 *
 * Precedência de detecção (doc 06 §Vocabulary):
 *  1. `role` DECLARADO no descriptor (dropdown "papel" do VAT Studio) —
 *     a fonte de verdade quando existe;
 *  2. NOME do clipe (regex pt/en) — o fallback histórico;
 *  3. fallbacks seguros (primeiro loop) para qualquer VAT.
 * (?vat= e ?vatB= entram com índice global; o grupo Vocabulary do painel
 * pode sobrescrever tudo por cima em runtime.)
 *
 * O slot `run` fica PREPARADO para o clipe de corrida do VAT Studio:
 * se existir (role/nome), é usado no estado "correndo" e o boost de
 * playback do walk é dispensado; sem ele, correndo = walk acelerado
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
  const clips: {
    i: number;
    name: string;
    loop: boolean;
    role: string | null;
  }[] = [];
  for (let i = 0; i < totalClipCount(); i++) {
    const c = clipInfo(i);
    if (c)
      clips.push({
        i,
        name: c.name.toLowerCase(),
        loop: c.loop,
        role: c.role ?? null,
      });
  }

  /** N-ésimo clipe com o papel declarado OU (fallback) nome casando. */
  const find = (role: string, re: RegExp, nth = 0): number => {
    let seen = 0;
    for (const c of clips) {
      if (c.role === role) {
        if (seen === nth) return c.i;
        seen += 1;
      }
    }
    seen = 0;
    for (const c of clips) {
      if (c.role === null && re.test(c.name)) {
        if (seen === nth) return c.i;
        seen += 1;
      }
    }
    return -1;
  };
  const firstLoop = clips.find((c) => c.loop)?.i ?? 0;

  const idle = ((v) => (v >= 0 ? v : firstLoop))(find("idle", /idle|parad/));
  const idle2 = ((v) => (v >= 0 ? v : idle))(find("idle", /idle|parad/, 1));
  const walk = ((v) => (v >= 0 ? v : idle))(find("walk", /andar|walk|caminh/));
  const runIdx = find("run", /corr|run/);
  const rezar = ((v) => (v >= 0 ? v : idle))(
    find("pray", /rez|pray|ajoelh|kneel/),
  );

  return {
    idle,
    idle2,
    walk,
    run: runIdx >= 0 ? runIdx : walk,
    rezar,
    hasRunClip: runIdx >= 0,
  };
}

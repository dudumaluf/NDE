/**
 * Detecta o fim da vinheta fixa do canal nos transcripts do acervo e calcula
 * quanto pular DENTRO de um corte de beat (sem re-encodar áudio).
 *
 * Frase alvo: "Sejam muito bem-vindos ao canal Afinal o que somos nós"
 * (variantes: seja/sejam, vindo/vindos, "sejam todos").
 *
 * Uso: importado por sync-content.mjs; também roda standalone para auditoria.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const INTRO_VARIANTS = [
  "sejam muito bem vindos ao canal afinal o que somos nos",
  "seja muito bem vindo ao canal afinal o que somos nos",
  "sejam todos muito bem vindos ao canal afinal o que somos nos",
];

/** Remove acentos e lixo — "nós." → "nos", "-vindos" → "vindos". */
export function normTok(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Fim (s) da vinheta no áudio-fonte, ou null se não achar. */
export function introEndInTranscript(transcript) {
  const words = transcript?.words;
  if (words?.length) {
    const toks = words
      .map((w) => ({
        t: normTok(w.text),
        end: Number(w.end ?? w.start ?? 0),
      }))
      .filter((w) => w.t);

    for (const phrase of INTRO_VARIANTS) {
      const target = phrase.split(" ").filter(Boolean);
      const m = target.length;
      for (let i = 0; i <= toks.length - m; i++) {
        let ok = true;
        for (let j = 0; j < m; j++) {
          if (toks[i + j].t !== target[j]) {
            ok = false;
            break;
          }
        }
        if (ok) return toks[i + m - 1].end;
      }
    }
  }

  // Fallback: 1º segmento só com a vinheta (comum ~4–6 s).
  const seg = transcript?.segments?.[0];
  if (!seg) return null;
  const segNorm = normTok(seg.text);
  for (const phrase of INTRO_VARIANTS) {
    if (segNorm === phrase || segNorm.startsWith(`${phrase} `)) {
      const end = Number(seg.end ?? 0);
      if (end > 0 && end < 12) return end;
    }
  }
  return null;
}

/**
 * Segundos a pular no arquivo do corte (relativo ao início do beat no vídeo).
 * Só aplica quando o beat começa perto do zero — vinheta é sempre no começo.
 */
export function skipInBeatCut(beatStart, beatEnd, introEnd) {
  const start = Number(beatStart);
  const end = Number(beatEnd);
  const intro = Number(introEnd);
  if (!Number.isFinite(intro) || intro <= 0) return 0;
  if (!Number.isFinite(start) || start > 8) return 0;
  const dur = end - start;
  if (!Number.isFinite(dur) || dur < 1) return 0;
  const skip = intro - start;
  if (skip < 0.35) return 0;
  if (skip > dur - 0.5) return 0;
  if (skip > 45) return 0;
  return Math.round(skip * 1000) / 1000;
}

/** video_id → fim da vinheta (s no áudio-fonte). */
export function loadIntroSkips(dataRoot) {
  const root = resolve(dataRoot);
  const map = {};
  if (!existsSync(root)) return map;

  for (const vid of readdirSync(root)) {
    const tp = join(root, vid, "transcript.json");
    if (!existsSync(tp)) continue;
    try {
      const t = JSON.parse(readFileSync(tp, "utf8"));
      const end = introEndInTranscript(t);
      if (end != null) map[vid] = end;
    } catch {
      /* transcript ilegível — sem skip */
    }
  }
  return map;
}

/** Enriquece audio.beats[] com skip_in onde couber. */
export function enrichPersonAudio(doc, introSkips) {
  const beats = doc.beats ?? [];
  const audioBeats = doc.audio?.beats;
  if (!audioBeats?.length) return 0;

  let n = 0;
  for (let i = 0; i < audioBeats.length; i++) {
    const ab = audioBeats[i];
    const beat = beats[i];
    if (!beat || !ab?.video_id) continue;
    const intro = introSkips[ab.video_id];
    if (intro == null) continue;
    const skip = skipInBeatCut(
      ab.start ?? beat.start,
      ab.end ?? beat.end,
      intro,
    );
    if (skip > 0) {
      ab.skip_in = skip;
      n += 1;
    }
  }
  return n;
}

// Auditoria: node scripts/intro-skip.mjs
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dataRoot = resolve(
    fileURLToPath(new URL("../../acervo/data", import.meta.url)),
  );
  const skips = loadIntroSkips(dataRoot);
  const ids = Object.keys(skips);
  const ends = ids.map((id) => skips[id]).sort((a, b) => a - b);
  console.log(`intro-skip: ${ids.length} vídeos com vinheta detectada`);
  if (ends.length) {
    const p50 = ends[Math.floor(ends.length / 2)];
    console.log(
      `  fim da frase: min=${ends[0].toFixed(2)}s med=${p50.toFixed(2)}s max=${ends.at(-1).toFixed(2)}s`,
    );
  }
}

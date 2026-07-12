/**
 * merge-clips — mescla 2+ AnimationClips em UM clipe contínuo (concatenação
 * temporal com crossfade curto nas emendas). Uso típico: micro-variações
 * (idle + olhar + idle → um idle longo) para não gastar slots de clipe na VAT.
 *
 * Módulo compartilhado: o Node (tools/vat-core.mjs, antes do bake) e o
 * browser (tools/studio/app.js, preview) importam ESTE arquivo — a duração e
 * o resultado do preview batem com o assado por construção.
 *
 * Método: amostragem densa (sampleRate) das tracks via interpolants do three
 * (mesma interpolação do AnimationMixer) e blend nas janelas de overlap —
 * lerp para vetores/números, slerp para quaternions. Não muta os clipes
 * fonte (as tracks novas nascem dos valores amostrados).
 */

import * as THREE from "three";

export const DEFAULT_MERGE_FADE = 0.2;
const MIN_DUR = 1e-3;

/** suaviza a rampa do crossfade (C1 nas emendas — velocidade contínua). */
const smooth = (t) => t * t * (3 - 2 * t);

/**
 * Overlap efetivo entre vizinhos: o fade pedido, limitado a metade do clipe
 * mais curto do par (um fade maior que isso "comeria" o clipe inteiro).
 */
export function effectiveOverlaps(durations, fade) {
  const out = [];
  for (let i = 0; i < durations.length - 1; i++)
    out.push(
      Math.max(0, Math.min(fade, durations[i] / 2, durations[i + 1] / 2)),
    );
  return out;
}

/** Duração do clipe combinado (soma − overlaps) — para orçamento/preview na UI. */
export function mergedDuration(durations, fade = DEFAULT_MERGE_FADE) {
  const durs = durations.map((d) => Math.max(d, MIN_DUR));
  const overlaps = effectiveOverlaps(durs, fade);
  return durs.reduce((a, b) => a + b, 0) - overlaps.reduce((a, b) => a + b, 0);
}

/**
 * Mescla os clipes na ordem dada. Retorna um AnimationClip novo.
 *
 * opts: { name, fade (s, default 0.2), sampleRate (amostras/s, default 30) }
 *
 * Tracks ausentes em um dos clipes: o valor vem do clipe vizinho que a tem
 * (interpolant do three clampa nas bordas) — segura a pose em vez de saltar.
 */
export function mergeClips(clips, opts = {}) {
  const {
    name = "combinado",
    fade = DEFAULT_MERGE_FADE,
    sampleRate = 30,
  } = opts;
  if (!Array.isArray(clips) || clips.length < 2)
    throw new Error("mergeClips precisa de 2+ clipes");

  const durs = clips.map((c) => Math.max(c.duration, MIN_DUR));
  const overlaps = effectiveOverlaps(durs, Math.max(0, fade));
  const starts = [0];
  for (let i = 0; i < clips.length - 1; i++)
    starts.push(starts[i] + durs[i] - overlaps[i]);
  const total = starts[clips.length - 1] + durs[clips.length - 1];

  // União de tracks por nome (mesmo esqueleto ⇒ normalmente idênticas).
  const meta = new Map(); // nome → { valueSize, quat, Ctor }
  const interp = clips.map(() => new Map()); // por clipe: nome → interpolant
  clips.forEach((clip, ci) => {
    for (const tr of clip.tracks) {
      if (typeof tr.values[0] !== "number") continue; // só tracks numéricas
      if (!meta.has(tr.name))
        meta.set(tr.name, {
          valueSize: tr.getValueSize(),
          quat: tr.ValueTypeName === "quaternion",
          Ctor: tr.constructor,
        });
      interp[ci].set(tr.name, tr.createInterpolant());
    }
  });
  if (meta.size === 0) throw new Error("nenhuma track numérica para mesclar");

  const n = Math.max(2, Math.round(total * sampleRate) + 1);
  const dt = total / (n - 1);
  const times = new Float32Array(n);
  const out = new Map(); // nome → Float32Array(n * valueSize)
  for (const [nm, m] of meta) out.set(nm, new Float32Array(n * m.valueSize));

  /** valor da track `nm` no clipe `ci` no tempo global t (clampado na borda). */
  const evalAt = (ci, nm, t) => {
    const ip = interp[ci].get(nm);
    if (!ip) return null;
    return ip.evaluate(Math.min(Math.max(t - starts[ci], 0), durs[ci]));
  };

  /**
   * Como o mixer com hold: se o clipe `from` não tem a track, segura o valor
   * do vizinho mais próximo que tem (para trás primeiro, depois para frente).
   */
  const evalHold = (from, nm, t) => {
    for (let ci = Math.min(from, clips.length - 1); ci >= 0; ci--) {
      const v = evalAt(ci, nm, t);
      if (v) return v;
    }
    for (let ci = from + 1; ci < clips.length; ci++) {
      const v = evalAt(ci, nm, t);
      if (v) return v;
    }
    return null;
  };

  let cur = 0; // índice do clipe corrente (starts é crescente)
  for (let k = 0; k < n; k++) {
    const t = k === n - 1 ? total : k * dt;
    times[k] = t;
    while (cur + 1 < clips.length && t >= starts[cur + 1]) cur += 1;
    // dentro da janela de fade-in do clipe `cur`? (overlap com o anterior)
    const fadeIn = cur > 0 ? overlaps[cur - 1] : 0;
    const local = t - starts[cur];
    const w = fadeIn > 0 && local < fadeIn ? smooth(local / fadeIn) : 1;

    for (const [nm, m] of meta) {
      const dst = out.get(nm);
      const o = k * m.valueSize;
      // ausências: segura a pose do vizinho mais próximo que tem a track
      // (como o mixer faria) em vez de saltar para zero.
      const b = evalAt(cur, nm, t) ?? evalHold(cur - 1, nm, t);
      const a = w < 1 ? (evalAt(cur - 1, nm, t) ?? evalHold(cur - 2, nm, t)) : b;
      if (!a || !b) continue; // impossível: o nome vem da união das tracks
      if (w >= 1 || a === b) {
        for (let c = 0; c < m.valueSize; c++) dst[o + c] = b[c];
      } else if (m.quat) {
        THREE.Quaternion.slerpFlat(dst, o, a, 0, b, 0, w);
      } else {
        for (let c = 0; c < m.valueSize; c++) dst[o + c] = a[c] + (b[c] - a[c]) * w;
      }
    }
  }

  const tracks = [];
  for (const [nm, m] of meta)
    tracks.push(new m.Ctor(nm, Array.from(times), Array.from(out.get(nm))));
  return new THREE.AnimationClip(name, total, tracks);
}

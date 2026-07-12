"""Passada complementar de ARCO EMOCIONAL (barata): o tempo interno da história.

Diferente do extract (2 passadas × vídeo, modelo frontier), aqui é UMA chamada
por PESSOA com modelo barato: fornecemos os beats já extraídos (índice, tipo,
resumo) + trechos do transcript ao redor de cada beat (~300 tokens/beat) e
pedimos a valência -2..+2 de cada um, o estado de entrada (antes do evento),
o de saída (depois) e o beat da virada. Cache no próprio person.json
(`arc_version` = prompt:modelo:hash-dos-beats — mudar os beats invalida).

Também vive aqui a TIMELINE NORMALIZADA (derivação local, sem LLM): duração
total da história = soma das partes na ordem; `t_norm` [0,1] de qualquer
timestamp local = (offset acumulado da parte + start) / total.
"""

from __future__ import annotations

import hashlib

from .config import AcervoConfig
from .extract import (
    PRICE_TABLE,
    call_with_repair,
    estimate_tokens,
    load_transcript,
)
from .schema import Arc, BeatEmotion, Person, Timeline, TimelinePart

PROMPT_VERSION = "arc-v1"
MODEL = "anthropic/claude-haiku-4.5"  # valência calibrada por trecho não pede frontier

BEAT_TOKENS = 300  # trecho de transcript por beat
CHARS_PER_TOKEN = 3.2  # mesma aproximação pt-BR do extract


def _beats_hash(person: Person) -> str:
    blob = "|".join(f"{b.video_id}:{b.start}:{b.end}" for b in person.beats)
    return hashlib.sha1(blob.encode()).hexdigest()[:8]


def cache_key(person: Person) -> str:
    """Muda se prompt, modelo OU os próprios beats mudarem (re-extração)."""
    return f"{PROMPT_VERSION}:{MODEL}:{_beats_hash(person)}"


# ── timeline normalizada (local, recomputável) ────────────────────────────


def compute_timeline(person: Person) -> Timeline:
    parts, offset = [], 0.0
    for s in sorted(person.sources, key=lambda s: s.part):
        dur = float(s.duration_s or 0.0)
        parts.append(TimelinePart(video_id=s.video_id, offset_s=offset, duration_s=dur))
        offset += dur
    return Timeline(total_s=offset, parts=parts)


def t_norm_of(timeline: Timeline, video_id: str, t: float | None) -> float | None:
    """Timestamp local do vídeo → [0,1] no tempo global da história."""
    if t is None or timeline.total_s <= 0:
        return None
    part = next((p for p in timeline.parts if p.video_id == video_id), None)
    if part is None:
        return None
    return round(min(1.0, max(0.0, (part.offset_s + t) / timeline.total_s)), 5)


# ── trechos de transcript por beat ────────────────────────────────────────


def _segment_lines(transcript: dict, start: float, end: float) -> list[str]:
    lines = []
    for c in transcript["segments"]:
        s = c.get("start")
        if s is None or s < start - 2 or s >= end:
            continue
        spk = f" [{c['speaker']}]" if c.get("speaker") else ""
        lines.append(f"[{s:.0f}]{spk} {c['text'].strip()}")
    return lines


def beat_excerpt(transcript: dict, start: float, end: float) -> str:
    """Trecho do beat com orçamento de ~BEAT_TOKENS: head 2/3 + tail 1/3
    (como o beat abre e como fecha — o meio é omitido se não couber)."""
    lines = _segment_lines(transcript, start, end)
    budget = int(BEAT_TOKENS * CHARS_PER_TOKEN)
    if sum(len(ln) + 1 for ln in lines) <= budget:
        return "\n".join(lines)
    head, used = [], 0
    for ln in lines:
        if used + len(ln) > budget * 2 // 3 and head:
            break
        head.append(ln)
        used += len(ln) + 1
    tail, used = [], 0
    for ln in reversed(lines[len(head):]):
        if used + len(ln) > budget // 3 and tail:
            break
        tail.append(ln)
        used += len(ln) + 1
    return "\n".join(head) + "\n[…]\n" + "\n".join(reversed(tail))


def beats_block(cfg: AcervoConfig, person: Person) -> str:
    transcripts = {
        s.video_id: load_transcript(cfg, s.video_id) for s in person.sources
    }
    part_of = {s.video_id: s.part for s in person.sources}
    blocks = []
    for i, b in enumerate(person.beats):
        t = transcripts[b.video_id]
        blocks.append(
            f"── BEAT {i} · {b.type} · parte {part_of.get(b.video_id, '?')} · "
            f"resumo: {b.summary}\n{beat_excerpt(t, b.start, b.end)}"
        )
    return "\n\n".join(blocks)


# ── prompt e chamada ──────────────────────────────────────────────────────


def build_prompt(cfg: AcervoConfig, person: Person) -> tuple[str, str]:
    from .extract import split_prompt

    md = (cfg.root / "prompts" / "extract_arc.md").read_text(encoding="utf-8")
    system, user = split_prompt(md)
    user = user.format(
        person_name=person.person.display_name,
        parts_total=len(person.sources),
        n_beats=len(person.beats),
        beats_block=beats_block(cfg, person),
    )
    return system, user


def _align_emotions(parsed: dict, n_beats: int) -> tuple[list[BeatEmotion], int]:
    """Garante 1 emoção por beat (mesma ordem/índice). Índices fora do range e
    duplicatas são descartados; lacunas herdam a valência do vizinho mais
    próximo (label vazio) e são CONTADAS — nunca inventamos rótulo."""
    by_index: dict[int, BeatEmotion] = {}
    for raw in parsed.get("beats_emotion", []) or []:
        try:
            be = BeatEmotion.model_validate(raw)
        except Exception:  # noqa: BLE001 — entrada malformada não derruba a pessoa
            continue
        if 0 <= be.beat_index < n_beats and be.beat_index not in by_index:
            by_index[be.beat_index] = be

    missing = [i for i in range(n_beats) if i not in by_index]
    for i in missing:
        neighbor = next(
            (by_index[j] for d in range(1, n_beats) for j in (i - d, i + d) if j in by_index),
            None,
        )
        by_index[i] = BeatEmotion(
            beat_index=i, valence=neighbor.valence if neighbor else 0, label=""
        )
    return [by_index[i] for i in range(n_beats)], len(missing)


def extract_arc(cfg: AcervoConfig, person: Person) -> tuple[Person, dict, int]:
    """Roda a passada na pessoa (sem tocar status). Retorna (pessoa, usage,
    n de beats sem valência do modelo — preenchidos por vizinho)."""
    system, user = build_prompt(cfg, person)
    parsed, usage = call_with_repair(cfg, system, user, model=MODEL)

    arc = Arc.model_validate(
        {k: parsed.get(k) for k in ("entrada", "saida", "virada") if parsed.get(k) is not None}
    )
    arc.beats_emotion, n_missing = _align_emotions(parsed, len(person.beats))
    if arc.virada is not None and not (0 <= arc.virada < len(person.beats)):
        arc.virada = None

    person.arc = arc
    person.arc_version = cache_key(person)
    person.timeline_norm = compute_timeline(person)

    note = f"arc: {n_missing} beats sem valência do modelo (preenchidos por vizinho)"
    person.needs_attention = [n for n in person.needs_attention if not n.startswith("arc:")]
    if n_missing:
        person.needs_attention.append(note)
    return person, usage, n_missing


# ── custo ─────────────────────────────────────────────────────────────────


def dry_run_estimate(cfg: AcervoConfig, persons: list[Person]) -> dict:
    tokens_in = tokens_out = 0
    for p in persons:
        system, user = build_prompt(cfg, p)
        tokens_in += estimate_tokens(len(system) + len(user))
        tokens_out += 30 * len(p.beats) + 150  # ~1 linha JSON/beat + endpoints
    p_in, p_out = PRICE_TABLE.get(MODEL, (1.0, 5.0))
    cost = tokens_in / 1e6 * p_in + tokens_out / 1e6 * p_out
    return {
        "pessoas": len(persons),
        "calls": len(persons),
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
        "modelo": MODEL,
        "custo_estimado_usd": round(cost, 2),
    }


def real_cost_usd(usages: list[dict]) -> float:
    p_in, p_out = PRICE_TABLE.get(MODEL, (1.0, 5.0))
    tin = sum(u.get("prompt_tokens", 0) + u.get("input_tokens", 0) for u in usages)
    tout = sum(u.get("completion_tokens", 0) + u.get("output_tokens", 0) for u in usages)
    return tin / 1e6 * p_in + tout / 1e6 * p_out

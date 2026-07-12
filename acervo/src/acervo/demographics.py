"""Passada complementar DEMOGRÁFICA (barata): metadados factuais declarados.

Diferente do extract (2 passadas × vídeo, modelo frontier), aqui é UMA chamada
por PESSOA com modelo barato: concatenamos a abertura da parte 1 (~8k tokens,
onde vive a apresentação: nome, idade, cidade, profissão, religião) com o
fechamento da última parte (~2k tokens, onde vivem balanço e "hoje eu…").
Cache no próprio person.json (`demographics_version` = prompt:modelo).
"""

from __future__ import annotations

import json

from .config import AcervoConfig
from .extract import (
    PRICE_TABLE,
    call_with_repair,
    estimate_tokens,
    load_transcript,
    split_prompt,
    transcript_block,
)
from .schema import Demographics, Person

PROMPT_VERSION = "demo-v1"
MODEL = "anthropic/claude-haiku-4.5"  # metadados factuais não pedem frontier

HEAD_TOKENS = 8000  # abertura da parte 1
TAIL_TOKENS = 2000  # fechamento da última parte
CHARS_PER_TOKEN = 3.2  # mesma aproximação pt-BR do extract


def cache_key() -> str:
    return f"{PROMPT_VERSION}:{MODEL}"


def _head_lines(lines: list[str], budget_chars: int) -> list[str]:
    out, used = [], 0
    for ln in lines:
        if used + len(ln) > budget_chars and out:
            break
        out.append(ln)
        used += len(ln) + 1
    return out


def _tail_lines(lines: list[str], budget_chars: int) -> list[str]:
    out, used = [], 0
    for ln in reversed(lines):
        if used + len(ln) > budget_chars and out:
            break
        out.append(ln)
        used += len(ln) + 1
    return list(reversed(out))


def build_excerpt(cfg: AcervoConfig, person: Person) -> tuple[str, str]:
    """(bloco de transcrição concatenado, speaker_note) para a pessoa."""
    sources = sorted(person.sources, key=lambda s: s.part)
    first, last = sources[0], sources[-1]
    head_budget = int(HEAD_TOKENS * CHARS_PER_TOKEN)
    tail_budget = int(TAIL_TOKENS * CHARS_PER_TOKEN)

    t_first = load_transcript(cfg, first.video_id)
    first_lines = transcript_block(t_first).split("\n")

    if first.video_id == last.video_id:
        head = _head_lines(first_lines, head_budget)
        tail = _tail_lines(first_lines, tail_budget)
        if len(head) + len(tail) >= len(first_lines):
            block = "\n".join(first_lines)  # transcript curto: cabe inteiro
        else:
            block = "\n".join(head) + "\n[… trecho do meio omitido …]\n" + "\n".join(tail)
    else:
        t_last = load_transcript(cfg, last.video_id)
        last_lines = transcript_block(t_last).split("\n")
        block = (
            f"── ABERTURA (parte {first.part}/{first.parts_total}) ──\n"
            + "\n".join(_head_lines(first_lines, head_budget))
            + "\n[… partes intermediárias omitidas …]\n"
            + f"── FECHAMENTO (parte {last.part}/{last.parts_total}) ──\n"
            + "\n".join(_tail_lines(last_lines, tail_budget))
        )

    speaker_note = (
        f"Os segmentos têm rótulos de falante; o falante principal (provavelmente "
        f"a pessoa depoente) é {t_first['main_speaker']}. Confirme pelo conteúdo."
        if t_first.get("main_speaker")
        else "A transcrição não separa falantes; distinga pelo contexto."
    )
    return block, speaker_note


def _published_year(cfg: AcervoConfig, person: Person) -> str:
    for s in sorted(person.sources, key=lambda s: s.part):
        meta_p = cfg.data_dir() / s.video_id / "meta.json"
        if meta_p.exists():
            raw = str(json.loads(meta_p.read_text(encoding="utf-8")).get("published_at") or "")
            if len(raw) >= 4 and raw[:4].isdigit():
                return raw[:4]
    return "desconhecido"


def build_prompt(cfg: AcervoConfig, person: Person) -> tuple[str, str]:
    md = (cfg.root / "prompts" / "extract_demographics.md").read_text(encoding="utf-8")
    system, user = split_prompt(md)
    block, speaker_note = build_excerpt(cfg, person)
    user = user.format(
        person_name=person.person.display_name,
        parts_total=len(person.sources),
        published_year=_published_year(cfg, person),
        speaker_note=speaker_note,
        transcript_block=block,
    )
    return system, user


def extract_demographics(cfg: AcervoConfig, person: Person) -> tuple[Person, dict]:
    """Roda a passada na pessoa (sem tocar status). Retorna (pessoa, usage)."""
    system, user = build_prompt(cfg, person)
    parsed, usage = call_with_repair(cfg, system, user, model=MODEL)
    person.demographics = Demographics.model_validate(parsed)
    person.demographics_version = cache_key()
    return person, usage


def dry_run_estimate(cfg: AcervoConfig, persons: list[Person]) -> dict:
    tokens_in = 0
    for p in persons:
        system, user = build_prompt(cfg, p)
        tokens_in += estimate_tokens(len(system) + len(user))
    tokens_out = 250 * len(persons)  # JSON pequeno de 9 campos
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

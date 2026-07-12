"""Extração estruturada via LLM (fal `openrouter/router`), em duas passadas
(doc 02 §7): fechada (taxonomia) e aberta (motivos emergentes).

Requisitos que este módulo implementa:
- req. 4: `--dry-run` com estimativa de tokens/custo antes de gastar;
- req. 5: validação Pydantic + retry com reparo (máx. configurável);
- req. 7: toda quote validada como substring (normalizada) do transcript —
  quote que não bate é rejeitada e contada, nunca inventada.
Cache por vídeo em data/<id>/extraction.json (keyed por prompt_version+model).
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from pathlib import Path
from typing import Any

import yaml

from .config import AcervoConfig
from .schema import Beat, ElementHit, EmergentMotif, Quote, Tone, VideoExtraction

PROMPT_VERSION = "v2"  # v2 = transcripts diarizados word-level (invalida cache v1)
ROUTER_ENDPOINT = "openrouter/router"

# preços aproximados por 1M tokens (USD) para estimativa de --dry-run
PRICE_TABLE = {
    "anthropic/claude-sonnet-4.5": (3.0, 15.0),
    "anthropic/claude-haiku-4.5": (1.0, 5.0),
    "google/gemini-2.5-flash": (0.30, 2.50),
    "google/gemini-2.5-pro": (1.25, 10.0),
    "openai/gpt-5-chat": (1.25, 10.0),
}


# ── helpers de texto ──────────────────────────────────────────────────────


def norm_text(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def estimate_tokens(chars: int) -> int:
    return int(chars / 3.2)  # aproximação para pt-BR


# ── taxonomia → blocos de prompt ─────────────────────────────────────────


def load_taxonomy(cfg: AcervoConfig) -> dict:
    return yaml.safe_load((cfg.root / "taxonomy.yaml").read_text(encoding="utf-8"))


def taxonomy_block(tax: dict) -> str:
    lines = []
    for el in tax["elementos"]:
        nota = f" — {el['nota']}" if el.get("nota") else ""
        lines.append(f"- `{el['key']}` ({el['label']}){nota}")
    return "\n".join(lines)


def adjacent_block(tax: dict) -> str:
    return "\n".join(f"- `{k}`" for k in tax.get("adjacentes", []))


def taxonomy_keys(tax: dict) -> str:
    keys = [el["key"] for el in tax["elementos"]] + list(tax.get("adjacentes", []))
    return ", ".join(keys)


# ── transcript → bloco de prompt ─────────────────────────────────────────


def load_transcript(cfg: AcervoConfig, video_id: str) -> dict:
    p = cfg.data_dir() / video_id / "transcript.json"
    doc = json.loads(p.read_text(encoding="utf-8"))
    if "segments" not in doc:  # retrocompat com transcripts v1
        doc["segments"] = doc.get("chunks", [])
        doc["words"] = []
        doc["main_speaker"] = None
    return doc


def transcript_block(transcript: dict) -> str:
    lines = []
    for c in transcript["segments"]:
        start = c.get("start")
        prefix = f"[{start:.0f}]" if start is not None else "[?]"
        spk = f" [{c['speaker']}]" if c.get("speaker") else ""
        lines.append(f"{prefix}{spk} {c['text'].strip()}")
    return "\n".join(lines)


# ── prompts ───────────────────────────────────────────────────────────────


def split_prompt(md: str) -> tuple[str, str]:
    """Separa as seções '# SYSTEM' e '# USER' de um prompt .md."""
    parts = re.split(r"^# (SYSTEM|USER)\s*$", md, flags=re.MULTILINE)
    sections = {parts[i]: parts[i + 1].strip() for i in range(1, len(parts) - 1, 2)}
    return sections.get("SYSTEM", ""), sections.get("USER", "")


def build_prompts(
    cfg: AcervoConfig, tax: dict, meta: dict, transcript: dict
) -> dict[str, tuple[str, str]]:
    """Retorna {'closed': (system, user), 'open': (system, user)}."""
    tblock = transcript_block(transcript)
    out = {}
    speaker_note = (
        f"Os segmentos têm rótulos de falante; o falante principal (provavelmente "
        f"a pessoa depoente) é {transcript['main_speaker']}. Confirme pelo conteúdo."
        if transcript.get("main_speaker")
        else "A transcrição não separa falantes; distinga pelo contexto."
    )
    for passada in ("closed", "open"):
        md = (cfg.root / "prompts" / f"extract_{passada}.md").read_text(encoding="utf-8")
        system, user = split_prompt(md)
        user = user.format(
            taxonomy_block=taxonomy_block(tax),
            adjacent_block=adjacent_block(tax),
            taxonomy_keys=taxonomy_keys(tax),
            person_name=meta["person_name"],
            video_id=meta["video_id"],
            part=meta["part"],
            parts_total=meta["parts_total"],
            title=meta.get("title", ""),
            speaker_note=speaker_note,
            transcript_block=tblock,
        )
        out[passada] = (system, user)
    return out


# ── chamada LLM ───────────────────────────────────────────────────────────


FALLBACK_MODEL = "google/gemini-2.5-pro"


def call_llm(
    cfg: AcervoConfig, system: str, user: str, model: str | None = None
) -> tuple[str, dict]:
    import time as _time

    import fal_client

    if not os.environ.get("FAL_KEY"):
        raise RuntimeError("FAL_KEY ausente — preencha o .env.")

    last: Exception | None = None
    # 3 tentativas no modelo principal (erros transientes do provider),
    # depois 1 no modelo de fallback — melhor um vídeo com modelo alternativo
    # do que uma pessoa inteira travada.
    plans = [model or cfg.extract.model] * 3 + [FALLBACK_MODEL]
    for i, model in enumerate(plans):
        try:
            result = fal_client.subscribe(
                ROUTER_ENDPOINT,
                arguments={
                    "model": model,
                    "system_prompt": system,
                    "prompt": user,
                    "temperature": 0.2,
                    "max_tokens": 8000,
                },
            )
            if result.get("error"):
                raise RuntimeError(f"router error: {result['error']}")
            return result.get("output", ""), result.get("usage") or {}
        except Exception as exc:  # noqa: BLE001 — retry consciente
            last = exc
            if i < len(plans) - 1:
                _time.sleep(4 * (i + 1))
    raise RuntimeError(f"LLM falhou após retries+fallback: {last}")


def parse_json_output(raw: str) -> dict:
    s = raw.strip()
    s = re.sub(r"^```(?:json)?\s*", "", s)
    s = re.sub(r"\s*```$", "", s)
    start, end = s.find("{"), s.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("saída sem objeto JSON")
    return json.loads(s[start : end + 1])


def call_with_repair(
    cfg: AcervoConfig, system: str, user: str, model: str | None = None
) -> tuple[dict, dict]:
    """Chama o LLM e tenta reparar saída inválida (req. de retry do doc 02)."""
    attempts = cfg.extract.max_retries + 1
    last_err: Exception | None = None
    usage_acc: dict = {}
    prompt = user
    for _ in range(attempts):
        raw, usage = call_llm(cfg, system, prompt, model=model)
        for k, v in usage.items():
            if isinstance(v, (int, float)):
                usage_acc[k] = usage_acc.get(k, 0) + v
        try:
            return parse_json_output(raw), usage_acc
        except (ValueError, json.JSONDecodeError) as exc:
            last_err = exc
            prompt = (
                user
                + "\n\nSUA RESPOSTA ANTERIOR FOI JSON INVÁLIDO ("
                + str(exc)[:200]
                + "). Responda novamente APENAS com o objeto JSON válido."
            )
    raise RuntimeError(f"saída inválida após {attempts} tentativas: {last_err}")


# ── validação de quotes (req. 7 — nunca inventar) ────────────────────────


def _locate_by_words(transcript: dict, qnorm: str) -> tuple[float | None, float | None]:
    """Localiza início/fim exatos da quote na sequência de palavras (v2)."""
    words = transcript.get("words") or []
    if not words:
        return None, None
    toks = [norm_text(w["text"]) for w in words]
    qtoks = qnorm.split()
    if not qtoks:
        return None, None
    n, m = len(toks), len(qtoks)
    for i in range(n - m + 1):
        if toks[i] == qtoks[0] and toks[i : i + m] == qtoks:
            return words[i].get("start"), words[i + m - 1].get("end")
    return None, None


def locate_quote(transcript: dict, text: str, start_hint: float | None) -> Quote | None:
    """Valida a quote como substring do transcript e localiza timestamps
    (precisão de palavra quando o transcript é v2 word-level)."""
    qnorm = norm_text(text)
    if len(qnorm) < 8:
        return None
    full = norm_text(transcript["text"])
    if qnorm not in full:
        return None

    # v2: início/fim exatos pela sequência de palavras
    w_start, w_end = _locate_by_words(transcript, qnorm)
    if w_start is not None:
        return Quote(
            video_id=transcript["video_id"], start=w_start, end=w_end, text=text.strip()
        )

    segments = transcript["segments"]
    order = range(len(segments))
    if start_hint is not None:
        order = sorted(
            order, key=lambda i: abs((segments[i].get("start") or 0) - start_hint)
        )
    for i in order:
        window = segments[i : i + 2]
        wnorm = norm_text(" ".join(c["text"] for c in window))
        if qnorm in wnorm:
            return Quote(
                video_id=transcript["video_id"],
                start=window[0].get("start"),
                end=window[-1].get("end"),
                text=text.strip(),
            )
    return Quote(video_id=transcript["video_id"], start=start_hint, end=None, text=text.strip())


# ── extração de um vídeo (2 passadas) ────────────────────────────────────


def extraction_path(cfg: AcervoConfig, video_id: str) -> Path:
    return cfg.data_dir() / video_id / "extraction.json"


def extract_video(
    cfg: AcervoConfig, tax: dict, meta: dict, force: bool = False
) -> VideoExtraction:
    video_id = meta["video_id"]
    out_path = extraction_path(cfg, video_id)
    cache_key = f"{PROMPT_VERSION}:{cfg.extract.model}"

    if out_path.exists() and not force:
        cached = json.loads(out_path.read_text(encoding="utf-8"))
        if f"{cached.get('prompt_version')}:{cached.get('model')}" == cache_key:
            return VideoExtraction.model_validate(cached)

    transcript = load_transcript(cfg, video_id)
    prompts = build_prompts(cfg, tax, meta, transcript)

    closed_raw, usage_c = call_with_repair(cfg, *prompts["closed"])
    open_raw, usage_o = call_with_repair(cfg, *prompts["open"])

    allowed = {el["key"] for el in tax["elementos"]}
    allowed_adj = set(tax.get("adjacentes", []))
    rejected = 0

    elements: list[ElementHit] = []
    for e in closed_raw.get("elements", []):
        if e.get("key") not in allowed:
            continue
        quotes = []
        for q in e.get("quotes", []):
            loc = locate_quote(transcript, q.get("text", ""), q.get("start_hint"))
            if loc:
                quotes.append(loc)
            else:
                rejected += 1
        conf = float(e.get("confidence", 0))
        if quotes and conf >= 0.6:
            elements.append(ElementHit(key=e["key"], confidence=min(conf, 1), quotes=quotes))

    motifs: list[EmergentMotif] = []
    for m in open_raw.get("emergent_motifs", []):
        quotes = []
        for q in m.get("quotes", []):
            loc = locate_quote(transcript, q.get("text", ""), q.get("start_hint"))
            if loc:
                quotes.append(loc)
            else:
                rejected += 1
        if quotes and m.get("label"):
            motifs.append(EmergentMotif(label=str(m["label"])[:80], quotes=quotes))

    beats = []
    for b in closed_raw.get("beats", []):
        try:
            beats.append(
                Beat(
                    video_id=video_id,
                    type=b.get("type", "outro"),
                    start=float(b.get("start", 0)),
                    end=float(b.get("end", 0)),
                    summary=str(b.get("summary", ""))[:300],
                )
            )
        except Exception:  # noqa: BLE001 — beat malformado não derruba o vídeo
            continue

    age_raw = closed_raw.get("age_at_event")
    if isinstance(age_raw, str):
        digits = re.findall(r"\d+", age_raw)
        age_raw = int(digits[0]) if digits else None

    usage = {k: usage_c.get(k, 0) + usage_o.get(k, 0) for k in {*usage_c, *usage_o}}
    ext = VideoExtraction(
        video_id=video_id,
        model=cfg.extract.model,
        prompt_version=PROMPT_VERSION,
        beats=beats,
        elements=elements,
        emergent_motifs=motifs,
        adjacent_tags=[t for t in closed_raw.get("adjacent_tags", []) if t in allowed_adj],
        summary_short=str(closed_raw.get("summary_short", ""))[:600],
        tone=Tone.model_validate(closed_raw.get("tone") or {}),
        age_at_event=age_raw,
        cause_category=closed_raw.get("cause_category") or "nao_informado",
        epistemology=closed_raw.get("epistemology") or "nao_avaliado",
        quotes_rejected=rejected,
        usage=usage,
    )
    out_path.write_text(
        json.dumps(ext.model_dump(), ensure_ascii=False, indent=1), encoding="utf-8"
    )
    return ext


def dry_run_estimate(cfg: AcervoConfig, tax: dict, videos: list[dict]) -> dict:
    tax_chars = len(taxonomy_block(tax)) + len(adjacent_block(tax))
    tokens_in = 0
    for v in videos:
        t = load_transcript(cfg, v["video_id"])
        tokens_in += 2 * estimate_tokens(len(transcript_block(t)) + tax_chars + 2500)
    tokens_out = 2 * 1800 * len(videos)
    p_in, p_out = PRICE_TABLE.get(cfg.extract.model, (3.0, 15.0))
    cost = tokens_in / 1e6 * p_in + tokens_out / 1e6 * p_out
    return {
        "videos": len(videos),
        "calls": 2 * len(videos),
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
        "modelo": cfg.extract.model,
        "custo_estimado_usd": round(cost, 2),
    }

"""Transcrição via fal.ai.

MODO PREMIUM (v2, 2026-07-10): `fal-ai/whisper` com `chunk_level=word` +
`diarize=true`. O transcript.json v2 guarda:
- `words`: timestamps por palavra (+ speaker quando a diarização cobre);
- `segments`: frases derivadas (agrupadas por falante/pontuação/pausa) —
  são o que os prompts de extração leem;
- `diarization_segments`: cru da API;
- `main_speaker`: heurística (quem fala mais = depoente, provável).

Modo rápido antigo (wizper/segment) continua suportado pelo mesmo código.
Backend plugável por config (doc 02 §3).
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

from .config import AcervoConfig
from .ytdl import audio_file_of

SCHEMA_VERSION = 2

# limites de tamanho dos segmentos derivados (para prompts legíveis)
SOFT_CHARS = 450
HARD_CHARS = 700
GAP_S = 1.2


def transcript_path(cfg: AcervoConfig, video_id: str) -> Path:
    return cfg.data_dir() / video_id / "transcript.json"


def has_transcript(cfg: AcervoConfig, video_id: str) -> bool:
    return transcript_path(cfg, video_id).exists()


TRANSCRIBE_DEADLINE_S = 1500  # 25 min por vídeo (fila + inferência)
NET_CALL_TIMEOUT_S = 300  # timeout duro por chamada de rede individual


def _with_timeout(fn, timeout_s: float, *args, **kwargs):
    """Executa uma chamada bloqueante com timeout duro (o fal_client não expõe
    timeouts — uploads/status pendurados eram a causa raiz dos travamentos)."""
    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(fn, *args, **kwargs).result(timeout=timeout_s)


def _transcribe_fal(cfg: AcervoConfig, audio: Path) -> dict[str, Any]:
    """Upload + submit + polling, cada chamada de rede com timeout duro e o
    conjunto com deadline — nenhuma conexão pendurada trava o batch."""
    import fal_client

    if not os.environ.get("FAL_KEY"):
        raise RuntimeError("FAL_KEY ausente — copie .env.example para .env e preencha.")

    last: Exception | None = None
    for attempt in range(3):
        try:
            audio_url = _with_timeout(fal_client.upload_file, NET_CALL_TIMEOUT_S, str(audio))
            arguments: dict[str, Any] = {
                "audio_url": audio_url,
                "task": "transcribe",
                "language": cfg.transcribe.language,
                "chunk_level": cfg.transcribe.chunk_level,
            }
            if cfg.transcribe.diarize:
                arguments["diarize"] = True
            if cfg.transcribe.prompt:
                arguments["prompt"] = cfg.transcribe.prompt

            handle = _with_timeout(
                fal_client.submit, 60, cfg.transcribe.model, arguments=arguments
            )
            deadline = time.time() + TRANSCRIBE_DEADLINE_S
            while time.time() < deadline:
                status = _with_timeout(handle.status, 60, with_logs=False)
                if isinstance(status, fal_client.Completed):
                    return _with_timeout(handle.get, 120)
                time.sleep(5)
            raise TimeoutError(
                f"transcrição excedeu {TRANSCRIBE_DEADLINE_S}s (request {handle.request_id})"
            )
        except Exception as exc:  # noqa: BLE001 — retry consciente
            last = exc
            time.sleep(8 * (attempt + 1))
    raise RuntimeError(f"transcrição falhou após 3 tentativas: {last}")


# ── derivação de estrutura (v2) ──────────────────────────────────────────


def _speaker_at(diar: list[dict], t: float | None) -> str | None:
    if t is None:
        return None
    for seg in diar:
        ts = seg.get("timestamp")
        if isinstance(ts, (list, tuple)) and len(ts) == 2 and ts[0] <= t <= ts[1]:
            return seg.get("speaker")
    return None


def _norm_chunks(result: dict[str, Any]) -> list[dict[str, Any]]:
    out = []
    for c in result.get("chunks") or []:
        ts = c.get("timestamp")
        ok = isinstance(ts, (list, tuple)) and len(ts) == 2
        out.append(
            {
                "start": float(ts[0]) if ok and ts[0] is not None else None,
                "end": float(ts[1]) if ok and ts[1] is not None else None,
                "text": c.get("text", ""),
                **({"speaker": c["speaker"]} if c.get("speaker") else {}),
            }
        )
    return out


def derive_segments(words: list[dict], diar: list[dict]) -> list[dict[str, Any]]:
    """Agrupa palavras em frases: quebra por troca de falante, pontuação
    forte (após tamanho mínimo), pausa longa ou tamanho máximo."""
    segments: list[dict[str, Any]] = []
    cur: dict[str, Any] | None = None

    for w in words:
        spk = w.get("speaker") or _speaker_at(diar, w.get("start"))
        text = (w.get("text") or "").strip()
        if not text:
            continue
        gap = (
            cur is not None
            and w.get("start") is not None
            and cur["end"] is not None
            and w["start"] - cur["end"] > GAP_S
        )
        if cur is None or spk != cur.get("speaker") or gap or len(cur["text"]) > HARD_CHARS:
            if cur:
                segments.append(cur)
            cur = {
                "start": w.get("start"),
                "end": w.get("end"),
                "speaker": spk,
                "text": text,
            }
            continue
        cur["text"] += " " + text
        cur["end"] = w.get("end") or cur["end"]
        if len(cur["text"]) > SOFT_CHARS and text[-1:] in ".?!":
            segments.append(cur)
            cur = None
    if cur:
        segments.append(cur)
    return segments


def main_speaker(segments: list[dict]) -> str | None:
    """Quem fala mais tempo = provavelmente a pessoa depoente."""
    totals: dict[str, float] = {}
    for s in segments:
        if s.get("speaker") and s.get("start") is not None and s.get("end") is not None:
            totals[s["speaker"]] = totals.get(s["speaker"], 0) + (s["end"] - s["start"])
    return max(totals, key=totals.get) if totals else None


def transcribe_video(cfg: AcervoConfig, video_id: str) -> dict[str, Any]:
    """Transcreve um vídeo já baixado e grava transcript.json. Retorna um resumo."""
    dest = cfg.data_dir() / video_id
    audio = audio_file_of(dest)
    if audio is None:
        raise FileNotFoundError(f"áudio de {video_id} não encontrado — rode fetch antes.")

    t0 = time.time()
    if cfg.transcribe.backend == "fal":
        result = _transcribe_fal(cfg, audio)
    else:
        raise NotImplementedError(
            f"backend de transcrição '{cfg.transcribe.backend}' ainda não implementado"
        )
    elapsed = time.time() - t0

    chunks = _norm_chunks(result)
    diar = [
        {
            "timestamp": s.get("timestamp"),
            "speaker": s.get("speaker"),
        }
        for s in (result.get("diarization_segments") or [])
    ]

    word_level = cfg.transcribe.chunk_level == "word"
    if word_level:
        words = chunks
        segments = derive_segments(words, diar)
    else:
        words = []
        segments = [{**c, "speaker": c.get("speaker")} for c in chunks]

    doc = {
        "schema_version": SCHEMA_VERSION,
        "video_id": video_id,
        "backend": cfg.transcribe.backend,
        "model": cfg.transcribe.model,
        "language": cfg.transcribe.language,
        "chunk_level": cfg.transcribe.chunk_level,
        "diarize": cfg.transcribe.diarize,
        "transcribed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "elapsed_s": round(elapsed, 1),
        "text": result.get("text", ""),
        "inferred_languages": result.get("inferred_languages"),
        "segments": segments,
        "words": words,
        "diarization_segments": diar,
        "main_speaker": main_speaker(segments),
    }
    out = transcript_path(cfg, video_id)
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

    return {
        "video_id": video_id,
        "chars": len(doc["text"]),
        "segments": len(segments),
        "words": len(words),
        "speakers": len({s.get("speaker") for s in segments if s.get("speaker")}),
        "elapsed_s": round(elapsed, 1),
        "last_end": segments[-1]["end"] if segments else None,
    }

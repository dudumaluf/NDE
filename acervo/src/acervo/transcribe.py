"""Transcrição via fal.ai (wizper — Whisper v3 Large otimizado).

Salva data/<id>/transcript.json com o texto completo e chunks com timestamps
(nível configurável; default `word` — beats e quotes dependem disso).
Backend plugável por config (doc 02 §3); `local` (faster-whisper) fica como
alternativa futura de custo zero.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

from .config import AcervoConfig
from .ytdl import audio_file_of

SCHEMA_VERSION = 1


def transcript_path(cfg: AcervoConfig, video_id: str) -> Path:
    return cfg.data_dir() / video_id / "transcript.json"


def has_transcript(cfg: AcervoConfig, video_id: str) -> bool:
    return transcript_path(cfg, video_id).exists()


def _transcribe_fal(cfg: AcervoConfig, audio: Path) -> dict[str, Any]:
    import fal_client

    if not os.environ.get("FAL_KEY"):
        raise RuntimeError("FAL_KEY ausente — copie .env.example para .env e preencha.")

    audio_url = fal_client.upload_file(str(audio))
    arguments: dict[str, Any] = {
        "audio_url": audio_url,
        "task": "transcribe",
        "language": cfg.transcribe.language,
        "chunk_level": cfg.transcribe.chunk_level,
    }
    if cfg.transcribe.diarize:
        arguments["diarize"] = True
    return fal_client.subscribe(cfg.transcribe.model, arguments=arguments)


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

    chunks = []
    for c in result.get("chunks") or []:
        ts = c.get("timestamp")
        chunk: dict[str, Any] = {
            "start": ts[0] if isinstance(ts, (list, tuple)) and len(ts) == 2 else None,
            "end": ts[1] if isinstance(ts, (list, tuple)) and len(ts) == 2 else None,
            "text": c.get("text", ""),
        }
        if c.get("speaker"):
            chunk["speaker"] = c["speaker"]
        chunks.append(chunk)

    doc = {
        "schema_version": SCHEMA_VERSION,
        "video_id": video_id,
        "backend": cfg.transcribe.backend,
        "model": cfg.transcribe.model,
        "language": cfg.transcribe.language,
        "chunk_level": cfg.transcribe.chunk_level,
        "transcribed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "elapsed_s": round(elapsed, 1),
        "text": result.get("text", ""),
        "inferred_languages": result.get("inferred_languages"),
        "chunks": chunks,
        "diarization_segments": result.get("diarization_segments") or [],
    }
    out = transcript_path(cfg, video_id)
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

    return {
        "video_id": video_id,
        "chars": len(doc["text"]),
        "chunks": len(chunks),
        "elapsed_s": round(elapsed, 1),
        "last_end": chunks[-1]["end"] if chunks else None,
    }

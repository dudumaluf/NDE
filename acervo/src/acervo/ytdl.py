"""Interação com o YouTube via yt-dlp (scan de canal e fetch de áudio+metadata)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yt_dlp


def resolve_channel_url(video_id: str) -> tuple[str, str]:
    """Descobre (channel_url, channel_name) a partir de um vídeo do canal."""
    opts = {"quiet": True, "no_warnings": True, "skip_download": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
    url = info.get("channel_url") or info.get("uploader_url")
    name = info.get("channel") or info.get("uploader") or ""
    if not url:
        raise RuntimeError(f"não consegui resolver o canal a partir do vídeo {video_id}")
    return url, name


def list_channel_videos(channel_url: str) -> list[dict[str, Any]]:
    """Lista rasa (id, title, duration) de todos os vídeos do canal."""
    videos_url = channel_url.rstrip("/") + "/videos"
    opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(videos_url, download=False)
    entries = info.get("entries") or []
    out = []
    for e in entries:
        if not e or e.get("id") is None:
            continue
        out.append(
            {
                "id": e["id"],
                "title": e.get("title"),
                "duration_s": e.get("duration"),
            }
        )
    return out


def fetch_audio_and_meta(video_id: str, dest_dir: Path, audio_format: str = "m4a") -> dict[str, Any]:
    """Baixa o melhor áudio + escreve meta.json. Idempotente por checagem externa."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    url = f"https://www.youtube.com/watch?v={video_id}"
    opts = {
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "format": f"bestaudio[ext={audio_format}]/bestaudio/best",
        "outtmpl": str(dest_dir / "audio.%(ext)s"),
        "writethumbnail": True,
        "noplaylist": True,
        # anti-throttle/timeouts do googlevideo (lote 5: 4 vídeos travavam
        # com "read operation timed out"): chunks re-abrem a conexão
        "socket_timeout": 30,
        "retries": 15,
        "fragment_retries": 15,
        "http_chunk_size": 10 * 1024 * 1024,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)

    meta = {
        "video_id": video_id,
        "url": url,
        "title": info.get("title"),
        "published_at": info.get("upload_date"),
        "duration_s": info.get("duration"),
        "channel": info.get("channel") or info.get("uploader"),
        "audio_ext": info.get("ext"),
        "view_count": info.get("view_count"),
        "description": info.get("description"),
    }
    (dest_dir / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return meta


def audio_file_of(dest_dir: Path) -> Path | None:
    """Retorna o arquivo de áudio baixado (qualquer extensão), se existir."""
    for f in sorted(dest_dir.glob("audio.*")):
        if f.suffix.lower() in {".m4a", ".webm", ".opus", ".mp3", ".ogg", ".wav"}:
            return f
    return None

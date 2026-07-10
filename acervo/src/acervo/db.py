"""Estado do pipeline em SQLite (doc 02 req. 2: resumível; dados canônicos ficam em JSON)."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

# Ordem de maturidade — usada para NUNCA rebaixar um vídeo (idempotência, req. 1).
STATUS_ORDER = ["raw", "fetched", "transcribed", "extracted", "reviewed", "exported"]


def status_rank(status: str) -> int:
    return STATUS_ORDER.index(status)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS videos (
          id            TEXT PRIMARY KEY,
          title         TEXT,
          duration_s    REAL,
          status        TEXT NOT NULL DEFAULT 'raw',
          first_seen_at TEXT NOT NULL,
          fetched_at    TEXT,
          error         TEXT
        );
        CREATE TABLE IF NOT EXISTS kv (
          key   TEXT PRIMARY KEY,
          value TEXT
        );
        """
    )
    return conn


def kv_get(conn: sqlite3.Connection, key: str) -> str | None:
    row = conn.execute("SELECT value FROM kv WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else None


def kv_set(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        "INSERT INTO kv (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )
    conn.commit()


def upsert_video(
    conn: sqlite3.Connection, video_id: str, title: str | None, duration_s: float | None
) -> bool:
    """Registra um vídeo se novo; atualiza título/duração sem tocar no status.

    Retorna True se o vídeo era novo.
    """
    existing = conn.execute("SELECT id FROM videos WHERE id = ?", (video_id,)).fetchone()
    if existing:
        conn.execute(
            "UPDATE videos SET title = COALESCE(?, title), duration_s = COALESCE(?, duration_s) "
            "WHERE id = ?",
            (title, duration_s, video_id),
        )
        return False
    conn.execute(
        "INSERT INTO videos (id, title, duration_s, status, first_seen_at) VALUES (?, ?, ?, 'raw', ?)",
        (video_id, title, duration_s, now_iso()),
    )
    return True


def advance_status(conn: sqlite3.Connection, video_id: str, new_status: str) -> None:
    """Avança o status de um vídeo — nunca rebaixa (req. 1)."""
    row = conn.execute("SELECT status FROM videos WHERE id = ?", (video_id,)).fetchone()
    if row is None:
        raise KeyError(f"vídeo desconhecido: {video_id}")
    if status_rank(new_status) > status_rank(row["status"]):
        conn.execute(
            "UPDATE videos SET status = ?, error = NULL WHERE id = ?", (new_status, video_id)
        )


def set_error(conn: sqlite3.Connection, video_id: str, message: str) -> None:
    conn.execute("UPDATE videos SET error = ? WHERE id = ?", (message[:500], video_id))


def counts_by_status(conn: sqlite3.Connection) -> dict[str, int]:
    rows = conn.execute("SELECT status, COUNT(*) AS n FROM videos GROUP BY status").fetchall()
    return {row["status"]: row["n"] for row in rows}

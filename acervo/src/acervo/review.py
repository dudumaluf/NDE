"""UI de revisão (`acervo review`) — doc 02 §9, adiantada do A4.

FastAPI servindo API JSON + página única (webui/index.html) + áudio com
suporte a Range (seek). Edições manuais entram em `locked_fields`
automaticamente (req. do doc 02 §9).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from . import db as dbm
from .config import AcervoConfig, load_config
from .people import list_people, load_person, save_person

WEBUI = Path(__file__).parent / "webui"


def create_app(cfg: AcervoConfig | None = None) -> FastAPI:
    cfg = cfg or load_config()
    app = FastAPI(title="acervo review")

    # áudio/thumbnails direto do data/ (StaticFiles suporta Range → seek)
    app.mount("/media", StaticFiles(directory=cfg.data_dir()), name="media")

    @app.get("/", response_class=HTMLResponse)
    def index() -> str:
        return (WEBUI / "index.html").read_text(encoding="utf-8")

    @app.get("/api/overview")
    def overview() -> dict:
        conn = dbm.connect(cfg.db_path())
        videos = dbm.counts_by_status(conn)
        people = {}
        cost_in = cost_out = 0
        for p in list_people(cfg):
            people[p.status] = people.get(p.status, 0) + 1
        for ext in cfg.data_dir().glob("*/extraction.json"):
            u = json.loads(ext.read_text(encoding="utf-8")).get("usage", {})
            cost_in += u.get("prompt_tokens", 0) + u.get("input_tokens", 0)
            cost_out += u.get("completion_tokens", 0) + u.get("output_tokens", 0)
        channel = dbm.kv_get(conn, "channel_name")
        return {
            "channel": channel,
            "videos": videos,
            "people": people,
            "llm_tokens": {"in": cost_in, "out": cost_out},
            "llm_cost_est_usd": round(cost_in / 1e6 * 3 + cost_out / 1e6 * 15, 2),
        }

    @app.get("/api/people")
    def people() -> list[dict]:
        out = []
        for p in list_people(cfg):
            out.append(
                {
                    "id": p.id,
                    "name": p.person.display_name,
                    "anonymized": p.person.anonymized,
                    "status": p.status,
                    "tone": p.tone.valence,
                    "cause": p.person.cause_category,
                    "age": p.person.age_at_event,
                    "elements": len(p.elements),
                    "motifs": len(p.emergent_motifs),
                    "parts": len(p.sources),
                    "duration_min": round(
                        sum(s.duration_s or 0 for s in p.sources) / 60
                    ),
                    "one_liner": p.summary.one_liner,
                    "needs_attention": len(p.needs_attention),
                }
            )
        return out

    @app.get("/api/people/{slug}")
    def person_detail(slug: str) -> dict:
        p = load_person(cfg, slug)
        if not p:
            raise HTTPException(404, "pessoa não encontrada")
        doc = p.model_dump()
        for s in doc["sources"]:
            vid = s["video_id"]
            audio = next(
                (
                    f"/media/{vid}/{f.name}"
                    for f in sorted((cfg.data_dir() / vid).glob("audio.*"))
                    if f.suffix.lower() in {".m4a", ".webm", ".mp3", ".opus"}
                ),
                None,
            )
            s["audio_url"] = audio
        return doc

    @app.get("/api/transcript/{video_id}")
    def transcript(video_id: str) -> FileResponse:
        p = cfg.data_dir() / video_id / "transcript.json"
        if not p.exists():
            raise HTTPException(404, "transcript não encontrado")
        return FileResponse(p, media_type="application/json")

    def _mark_edit(p, field: str) -> None:
        if field not in p.review.locked_fields:
            p.review.locked_fields.append(field)

    @app.post("/api/people/{slug}/approve")
    def approve(slug: str) -> dict:
        p = load_person(cfg, slug)
        if not p:
            raise HTTPException(404)
        p.status = "reviewed"
        p.review.reviewed_by = "dudu"
        p.review.reviewed_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        save_person(cfg, p)
        return {"ok": True, "status": p.status}

    @app.post("/api/people/{slug}/unapprove")
    def unapprove(slug: str) -> dict:
        p = load_person(cfg, slug)
        if not p:
            raise HTTPException(404)
        p.status = "extracted"
        p.review.reviewed_by = None
        p.review.reviewed_at = None
        save_person(cfg, p)
        return {"ok": True, "status": p.status}

    @app.post("/api/people/{slug}/anonymize")
    def anonymize(slug: str) -> dict:
        p = load_person(cfg, slug)
        if not p:
            raise HTTPException(404)
        p.person.anonymized = not p.person.anonymized
        _mark_edit(p, "person.anonymized")
        save_person(cfg, p)
        return {"ok": True, "anonymized": p.person.anonymized}

    @app.patch("/api/people/{slug}")
    def edit(slug: str, body: dict) -> dict:
        p = load_person(cfg, slug)
        if not p:
            raise HTTPException(404)
        if "one_liner" in body:
            p.summary.one_liner = str(body["one_liner"])[:200]
            _mark_edit(p, "summary.one_liner")
        if "short" in body:
            p.summary.short = str(body["short"])[:1500]
            _mark_edit(p, "summary.short")
        if "display_name" in body:
            p.person.display_name = str(body["display_name"])[:80]
            _mark_edit(p, "person.display_name")
        if "remove_element" in body:
            p.elements = [e for e in p.elements if e.key != body["remove_element"]]
            _mark_edit(p, "elements")
        save_person(cfg, p)
        return {"ok": True}

    return app


def run(port: int = 8777) -> None:
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=port, log_level="warning")

"""Geração do `export/` — o contrato com a experiência 3D (doc 02 §10).

Autocontido e regenerável: manifest, taxonomy, people (subset público,
respeitando anonimização), layout, graph, clusters, stats e cortes de áudio
(ffmpeg, fades de 150ms + loudnorm).
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import time
from pathlib import Path

import yaml

from .config import AcervoConfig
from .people import list_people
from .schema import Person
from .ytdl import audio_file_of

EXPORT_VERSION = 1


def export_dir(cfg: AcervoConfig) -> Path:
    d = cfg.root / cfg.paths.export
    d.mkdir(parents=True, exist_ok=True)
    return d


# ── áudio ─────────────────────────────────────────────────────────────────


def cut_audio(
    src: Path, dest: Path, start: float, end: float, gain_db: float = 0.0
) -> bool:
    """Corta [start, end] com fade in/out de 150ms e loudnorm."""
    if dest.exists():
        return True
    dur = max(0.4, end - start)
    filters = [
        f"afade=t=in:st=0:d=0.15",
        f"afade=t=out:st={dur - 0.15:.3f}:d=0.15",
        "loudnorm=I=-18:TP=-2:LRA=11",
    ]
    if gain_db:
        filters.append(f"volume={gain_db}dB")
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{max(0, start):.3f}", "-t", f"{dur:.3f}",
        "-i", str(src),
        "-af", ",".join(filters),
        "-ac", "1", "-b:a", "96k",
        str(dest),
    ]
    return subprocess.run(cmd, capture_output=True).returncode == 0


def export_person_audio(cfg: AcervoConfig, p: Person, out_root: Path) -> dict:
    """Corta beats e quotes de uma pessoa. Retorna índice de arquivos."""
    adir = out_root / "audio" / p.id
    adir.mkdir(parents=True, exist_ok=True)
    audio_of = {
        s.video_id: audio_file_of(cfg.data_dir() / s.video_id) for s in p.sources
    }
    index: dict = {"beats": [], "quotes": {}, "whisper": None}

    for i, b in enumerate(p.beats):
        src = audio_of.get(b.video_id)
        if not src or b.type == "outro":
            continue
        name = f"beat_{i:03d}_{b.type}.mp3"
        if cut_audio(src, adir / name, b.start, b.end):
            index["beats"].append(
                {"file": name, "type": b.type, "video_id": b.video_id,
                 "start": b.start, "end": b.end}
            )

    for e in p.elements:
        files = []
        for j, q in enumerate(e.quotes[:4]):
            src = audio_of.get(q.video_id)
            if not src or q.start is None:
                continue
            end = q.end if q.end and q.end > q.start else q.start + 22
            name = f"q_{e.key}_{j}.mp3"
            if cut_audio(src, adir / name, max(0, q.start - 0.4), end + 0.6):
                files.append(name)
        if files:
            index["quotes"][e.key] = files

    # sussurro: primeira quote de eqm/elemento forte, em volume baixo
    first = next(
        (q for e in p.elements for q in e.quotes if q.start is not None), None
    )
    if first:
        src = audio_of.get(first.video_id)
        end = first.end if first.end and first.end > first.start else first.start + 10
        if src and cut_audio(
            src, adir / "whisper.mp3", first.start, min(end, first.start + 12), gain_db=-9
        ):
            index["whisper"] = "whisper.mp3"
    return index


# ── documentos ────────────────────────────────────────────────────────────


def public_person(p: Person, audio_index: dict, analysis_row: dict | None) -> dict:
    name = "Anônima" if p.person.anonymized else p.person.display_name
    return {
        "schema_version": p.schema_version,
        "id": p.id,
        "display_name": name,
        "anonymized": p.person.anonymized,
        "age_at_event": p.person.age_at_event,
        "cause_category": p.person.cause_category,
        "demographics": p.demographics.model_dump(),
        "status": p.status,
        "sources": [
            {"video_id": s.video_id, "part": s.part, "parts_total": s.parts_total,
             "url": s.url, "duration_s": s.duration_s}
            for s in p.sources
        ],
        "summary": p.summary.model_dump(),
        "tone": p.tone.model_dump(),
        "beats": [b.model_dump() for b in p.beats if b.type != "outro"],
        "elements": [
            {
                "key": e.key,
                "confidence": e.confidence,
                "quotes": [q.model_dump() for q in e.quotes[:4]],
            }
            for e in p.elements
        ],
        "emergent_motifs": [m.model_dump() for m in p.emergent_motifs],
        "adjacent_tags": p.adjacent_tags,
        "derived": {
            "cluster_id": analysis_row["cluster"] if analysis_row else None,
            "umap3d": analysis_row["umap3d"] if analysis_row else None,
            "umap2d": analysis_row["umap2d"] if analysis_row else None,
        },
        "audio": audio_index,
    }


def run_export(cfg: AcervoConfig, allow_unreviewed: bool = False, with_audio: bool = True) -> dict:
    persons = list_people(cfg)
    if allow_unreviewed:
        persons = [p for p in persons if p.status in ("extracted", "reviewed", "exported")]
    else:
        persons = [p for p in persons if p.status in ("reviewed", "exported")]
    if not persons:
        raise RuntimeError(
            "nenhuma pessoa elegível — aprove na UI (`acervo review`) ou use --allow-unreviewed"
        )

    analysis_path = cfg.data_dir() / "analysis" / "analysis.json"
    analysis = (
        json.loads(analysis_path.read_text(encoding="utf-8"))
        if analysis_path.exists()
        else None
    )
    arow = {r["id"]: r for r in (analysis or {}).get("people", [])}

    out = export_dir(cfg)
    (out / "people").mkdir(exist_ok=True)

    tax = yaml.safe_load((cfg.root / "taxonomy.yaml").read_text(encoding="utf-8"))
    (out / "taxonomy.json").write_text(
        json.dumps(
            {
                "version": tax.get("version"),
                "dominios": tax.get("dominios"),
                "elementos": [
                    {k: el.get(k) for k in ("key", "label", "dominio", "nota")}
                    for el in tax.get("elementos", [])
                ],
                "adjacentes": tax.get("adjacentes", []),
            },
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )

    people_index = []
    for p in persons:
        audio_index = export_person_audio(cfg, p, out) if with_audio else {}
        doc = public_person(p, audio_index, arow.get(p.id))
        (out / "people" / f"{p.id}.json").write_text(
            json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8"
        )
        people_index.append(
            {
                "id": p.id,
                "display_name": doc["display_name"],
                "tone": p.tone.valence,
                "cluster_id": doc["derived"]["cluster_id"],
                "elements": [e.key for e in p.elements],
                "n_beats": len(doc["beats"]),
            }
        )

    if analysis:
        (out / "layout.json").write_text(
            json.dumps(
                {r["id"]: {"umap3d": r["umap3d"], "umap2d": r["umap2d"],
                           "cluster_id": r["cluster"]} for r in analysis["people"]},
                ensure_ascii=False, indent=1,
            ),
            encoding="utf-8",
        )
        (out / "graph.json").write_text(
            json.dumps({"edges": analysis["edges"]}, ensure_ascii=False, indent=1),
            encoding="utf-8",
        )
        (out / "clusters.json").write_text(
            json.dumps(analysis["clusters"], ensure_ascii=False, indent=1),
            encoding="utf-8",
        )
        (out / "stats.json").write_text(
            json.dumps(
                {"cooccurrence": analysis["cooccurrence"],
                 "motif_themes": analysis["motif_themes"]},
                ensure_ascii=False, indent=1,
            ),
            encoding="utf-8",
        )

    manifest = {
        "export_version": EXPORT_VERSION,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "channel": persons[0].channel if persons else "",
        "counts": {
            "people": len(persons),
            "beats": sum(len(p.beats) for p in persons),
            "elements_distinct": len({e.key for p in persons for e in p.elements}),
        },
        "allow_unreviewed": allow_unreviewed,
        "people": people_index,
    }
    blob = json.dumps(manifest, sort_keys=True).encode()
    manifest["content_hash"] = hashlib.sha256(blob).hexdigest()[:16]
    (out / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    return manifest

"""Materialização e merge do documento por pessoa (data/people/<slug>.json)."""

from __future__ import annotations

import json
from pathlib import Path

from .config import AcervoConfig
from .schema import (
    Person,
    PersonMeta,
    SourceVideo,
    Summary,
    Tone,
    VideoExtraction,
)

STATUS_ORDER = ["grouped", "extracted", "reviewed", "exported"]

EPISTEMOLOGY_PRIORITY = ["lido", "meditacao", "reconstruido", "direto", "nao_avaliado"]


def people_dir(cfg: AcervoConfig) -> Path:
    d = cfg.data_dir() / "people"
    d.mkdir(parents=True, exist_ok=True)
    return d


def person_path(cfg: AcervoConfig, slug: str) -> Path:
    return people_dir(cfg) / f"{slug}.json"


def load_person(cfg: AcervoConfig, slug: str) -> Person | None:
    p = person_path(cfg, slug)
    if not p.exists():
        return None
    return Person.model_validate_json(p.read_text(encoding="utf-8"))


def save_person(cfg: AcervoConfig, person: Person) -> None:
    person_path(cfg, person.id).write_text(
        json.dumps(person.model_dump(), ensure_ascii=False, indent=1), encoding="utf-8"
    )


def list_people(cfg: AcervoConfig) -> list[Person]:
    return [
        Person.model_validate_json(p.read_text(encoding="utf-8"))
        for p in sorted(people_dir(cfg).glob("*.json"))
    ]


def upsert_grouped(cfg: AcervoConfig, slug: str, group: dict, channel: str) -> Person:
    """Cria/atualiza a pessoa a partir do agrupamento — nunca rebaixa status."""
    existing = load_person(cfg, slug)
    sources = [
        SourceVideo(
            video_id=v["id"],
            part=v["part"],
            parts_total=v["total"],
            url=f"https://www.youtube.com/watch?v={v['id']}",
            title=v["title"] or "",
            duration_s=v.get("duration_s"),
        )
        for v in group["videos"]
    ]
    if existing:
        existing.sources = sources
        if not existing.person.display_name and group["name"]:
            existing.person.display_name = group["name"]
        save_person(cfg, existing)
        return existing

    person = Person(
        id=slug,
        channel=channel,
        sources=sources,
        person=PersonMeta(display_name=group["name"] or group["base"]),
    )
    save_person(cfg, person)
    return person


def merge_extractions(person: Person, extractions: list[VideoExtraction]) -> Person:
    """Agrega as extrações das partes no documento da pessoa."""
    part_of = {s.video_id: s.part for s in person.sources}
    extractions = sorted(extractions, key=lambda e: part_of.get(e.video_id, 99))

    beats = [b for e in extractions for b in e.beats]

    by_key: dict[str, list] = {}
    for e in extractions:
        for el in e.elements:
            by_key.setdefault(el.key, []).append(el)
    elements = []
    for key, hits in by_key.items():
        merged = hits[0].model_copy(deep=True)
        merged.confidence = max(h.confidence for h in hits)
        merged.quotes = [q for h in hits for q in h.quotes]
        elements.append(merged)
    elements.sort(key=lambda el: -el.confidence)

    motifs = [m for e in extractions for m in e.emergent_motifs]
    adjacent = sorted({t for e in extractions for t in e.adjacent_tags})

    valences = {e.tone.valence for e in extractions if e.tone.notes or e.tone.valence}
    tone = Tone(
        valence=valences.pop() if len(valences) == 1 else "mista",
        notes=" / ".join(e.tone.notes for e in extractions if e.tone.notes)[:400],
    )

    age = next((e.age_at_event for e in extractions if e.age_at_event), None)
    cause = next(
        (e.cause_category for e in extractions if e.cause_category != "nao_informado"),
        "nao_informado",
    )
    epi = min(
        (e.epistemology for e in extractions),
        key=lambda x: EPISTEMOLOGY_PRIORITY.index(x),
        default="nao_avaliado",
    )

    parts_summary = " ".join(
        f"[{i + 1}/{len(extractions)}] {e.summary_short}" for i, e in enumerate(extractions)
    )
    one_liner = extractions[0].summary_short.split(".")[0][:160] if extractions else ""

    person.beats = beats
    person.elements = elements
    person.emergent_motifs = motifs
    person.adjacent_tags = adjacent
    person.tone = tone
    person.summary = Summary(one_liner=one_liner, short=parts_summary[:1200])
    person.person.age_at_event = person.person.age_at_event or age
    if person.person.cause_category == "nao_informado":
        person.person.cause_category = cause
    person.report_epistemology = epi
    person.needs_attention = [
        f"{e.video_id}: {e.quotes_rejected} quotes rejeitadas"
        for e in extractions
        if e.quotes_rejected > 0
    ]
    if person.status == "grouped":
        person.status = "extracted"
    return person

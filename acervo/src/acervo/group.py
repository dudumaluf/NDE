"""Agrupamento vídeo→pessoa a partir dos títulos do canal.

Padrão observado: "N/M – <frase-título> - EQM de <Nome> | Experiência de
Quase Morte". A chave de agrupamento é a FRASE-TÍTULO normalizada (o nome
pode faltar ou variar entre partes — caso real: Anelise 1/2 sem nome), e o
display_name é o nome mais completo entre as partes.
"""

from __future__ import annotations

import re
import unicodedata

TITLE_RE = re.compile(
    r"^\s*(?:(?P<part>\d+)\s*/\s*(?P<total>\d+)\s*[–\-—]\s*)?"
    r"(?P<base>.*?)"
    r"(?:\s*[-–—]\s*EQM de\s*(?P<name>[^|]*))?"
    r"(?:\s*\|.*)?$",
    re.IGNORECASE,
)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower().strip())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s)


def slugify(s: str) -> str:
    s = norm(s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "sem-nome"


def parse_title(title: str) -> dict:
    m = TITLE_RE.match(title or "")
    if not m:
        return {"part": 1, "total": 1, "base": title or "", "name": ""}
    return {
        "part": int(m.group("part") or 1),
        "total": int(m.group("total") or 1),
        "base": (m.group("base") or "").strip(" -–—"),
        "name": (m.group("name") or "").strip(),
    }


def is_testimony(title: str) -> bool:
    """Filtro 'é depoimento?' — vídeos institucionais ficam de fora."""
    return "eqm" in norm(title)


def group_videos(rows: list[dict]) -> dict[str, dict]:
    """rows: [{id, title, duration_s}] → {person_slug: {name, base, videos:[…]}}.

    Agrupa pela frase-título normalizada; escolhe o nome mais longo entre as
    partes como display_name.
    """
    groups: dict[str, dict] = {}
    for row in rows:
        info = parse_title(row["title"] or "")
        if not is_testimony(row["title"] or ""):
            continue
        key = norm(info["base"])
        g = groups.setdefault(
            key, {"base": info["base"], "name": "", "videos": []}
        )
        g["videos"].append({**row, **info})
        if len(info["name"]) > len(g["name"]):
            g["name"] = info["name"]

    out: dict[str, dict] = {}
    for g in groups.values():
        g["videos"].sort(key=lambda v: v["part"])
        slug = slugify(g["name"] or g["base"])
        # colisão improvável de slug: sufixa com a base
        if slug in out:
            slug = f"{slug}-{slugify(g['base'])[:24]}"
        out[slug] = g
    return out

"""Agrupamento vídeo→pessoa a partir dos títulos do canal.

Padrão canônico: "N/M – <frase-título> - EQM de <Nome> | Experiência de
Quase Morte". A chave de agrupamento é a FRASE-TÍTULO normalizada (o nome
pode faltar ou variar entre partes — caso real: Anelise 1/2 sem nome), e o
display_name é o nome mais completo entre as partes.

Extensões (fix curadoria lote 4):
- artigo no nome: "EQM de|do|da|dos|das <Nome>" (perdíamos "EQM do Ricardo
  Pereira");
- caudas em inglês: "… - NDE by <Nome>", "… - <Nome>'s NDE", "… - <Nome> NDE"
  (partes 2/3 e 3/3 do Altair, 1/2 da Ivy);
- número de parte fora do prefixo N/M: "<frase> (1de2)", "<frase> 1de2",
  "EQM 1de2 - <frase>" e "<frase> (1ª parte)" — séries Lázaro/COVID/KABBALAH/
  Liduína/Drika;
- o filtro de depoimento aceita NDE além de EQM (títulos só em inglês);
- 2ª passada: grupos com o MESMO nome próprio explícito (≥2 palavras) são
  unidos — é o que junta partes em inglês e vídeos avulsos da mesma pessoa.

REGRA DE OURO: slugs existentes são chaves de pasta em data/people/ e NUNCA
mudam. Pessoas já materializadas entram como ÂNCORAS (vídeo→slug): um grupo
que contém vídeo de pessoa existente herda o slug dela; se o mesmo nome
aponta para 2+ pessoas existentes distintas (caso Nayda Cabral), a passada
de nome não une nada — melhor deixar de fora que agrupar errado.
"""

from __future__ import annotations

import re
import unicodedata

TITLE_RE = re.compile(
    r"^\s*(?:(?P<part>\d+)\s*/\s*(?P<total>\d+)\s*[–\-—]\s*)?"
    r"(?P<base>.*?)"
    r"(?:\s*[-–—]\s*(?:"
    r"EQM\s+d[eoa]s?\b\s*(?P<name>[^|]*)"
    r"|NDE\s+by\s+(?P<name_by>[^|]+?)"
    r"|(?P<name_en>[^|]+?)(?:['’]s)?\s+NDE\b"
    r"))?"
    r"(?:\s*\|.*)?$",
    re.IGNORECASE,
)

# "EQM 1de2 - <frase>" (prefixo), "<frase> 1de2" / "<frase> (1of2)" (cauda)
# e "<frase> (1ª parte) …" (ordinal, total desconhecido).
PART_PREFIX_RE = re.compile(
    r"^(?:EQM|NDE)\s*[–\-—]?\s*(\d+)\s*(?:de|of)\s*(\d+)\s*[–\-—]\s*",
    re.IGNORECASE,
)
PART_TAIL_RE = re.compile(
    r"(?:\s|\()\s*\(?(\d+)\s*(?:de|of)\s*(\d+)\)?\s*$",
    re.IGNORECASE,
)
PART_ORDINAL_RE = re.compile(r"\(\s*(\d+)\s*[ªa°º]?\s*parte\s*\)", re.IGNORECASE)

PT_PARTICLES = {"de", "da", "do", "das", "dos", "e"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower().strip())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s)


def slugify(s: str) -> str:
    s = norm(s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "sem-nome"


def _part_from_base(base: str) -> tuple[str, str | None, str | None]:
    """Extrai número de parte embutido na frase-título (fora do prefixo N/M)."""
    m = PART_PREFIX_RE.match(base)
    if m:
        return base[m.end() :].strip(" -–—"), m.group(1), m.group(2)
    m = PART_TAIL_RE.search(base)
    if m:
        return base[: m.start()].strip(" -–—"), m.group(1), m.group(2)
    m = PART_ORDINAL_RE.search(base)
    if m:
        cleaned = (base[: m.start()] + " " + base[m.end() :]).strip(" -–—")
        return re.sub(r"\s+", " ", cleaned), m.group(1), None
    return base, None, None


def parse_title(title: str) -> dict:
    m = TITLE_RE.match(title or "")
    if not m:
        return {"part": 1, "total": 1, "base": title or "", "name": ""}
    base = (m.group("base") or "").strip(" -–—")
    name = (m.group("name") or m.group("name_by") or m.group("name_en") or "").strip()
    part, total = m.group("part"), m.group("total")
    if part is None:
        base, part, total = _part_from_base(base)
    return {
        "part": int(part or 1),
        "total": int(total or 1),
        "base": base,
        "name": name,
    }


def is_testimony(title: str) -> bool:
    """Filtro 'é depoimento?' — vídeos institucionais ficam de fora."""
    return re.search(r"\b(?:eqm|nde)s?\b", norm(title)) is not None


def _name_key(name: str) -> str:
    """Chave de identidade por nome próprio, insensível a partículas
    ("Lucila Toledo de Barros" == "Lucila Toledo Barros"). Nome de UMA
    palavra é ambíguo demais para unir grupos — retorna vazio."""
    toks = [t for t in slugify(name).split("-") if t and t not in PT_PARTICLES]
    return "-".join(toks) if len(toks) >= 2 else ""


def _finalize(g: dict) -> None:
    """Ordena/renumera as partes de um grupo consolidado.

    Vídeos avulsos unidos por nome chegam todos como 1/1 — renumera 1..n
    (séries com total declarado primeiro, depois avulsos por título). Sem
    duplicata, apenas garante total ≥ maior parte vista (séries "(Nª parte)"
    não declaram o total)."""
    vids = g["videos"]
    vids.sort(key=lambda v: (v["part"], norm(v["title"] or "")))
    parts = [v["part"] for v in vids]
    if len(set(parts)) < len(parts):
        vids.sort(key=lambda v: (-v["total"], v["part"], norm(v["title"] or "")))
        for i, v in enumerate(vids):
            v["part"] = i + 1
            v["total"] = len(vids)
    else:
        mx = max(parts)
        for v in vids:
            v["total"] = max(v["total"], mx)


def group_videos(
    rows: list[dict], existing: dict[str, set[str]] | None = None
) -> dict[str, dict]:
    """rows: [{id, title, duration_s}] → {person_slug: {name, base, videos:[…]}}.

    Agrupa pela frase-título normalizada; une grupos com o mesmo nome próprio
    explícito; escolhe o nome mais longo entre as partes como display_name.
    `existing` ({slug: {video_ids}} de data/people/) ancora slugs já
    materializados — eles nunca são re-slugificados.
    """
    existing = existing or {}
    by_video = {vid: slug for slug, vids in existing.items() for vid in vids}

    groups: dict[str, dict] = {}
    for row in rows:
        if not is_testimony(row["title"] or ""):
            continue
        info = parse_title(row["title"] or "")
        key = norm(info["base"])
        g = groups.setdefault(key, {"base": info["base"], "name": "", "videos": []})
        g["videos"].append({**row, **info})
        if len(info["name"]) > len(g["name"]):
            g["name"] = info["name"]

    def anchors(g: dict) -> set[str]:
        return {by_video[v["id"]] for v in g["videos"] if v["id"] in by_video}

    # 2ª passada: mesmo nome próprio explícito → mesma pessoa.
    buckets: dict[str, list[str]] = {}
    for key, g in groups.items():
        nk = _name_key(g["name"])
        if nk:
            buckets.setdefault(nk, []).append(key)
    for keys in buckets.values():
        if len(keys) < 2:
            continue
        anchor_slugs = set().union(*(anchors(groups[k]) for k in keys))
        if len(anchor_slugs) > 1:
            continue  # nome aponta p/ 2+ pessoas existentes (caso Nayda): não tocar
        keys.sort(
            key=lambda k: (
                not anchors(groups[k]),
                min(v["part"] for v in groups[k]["videos"]),
                k,
            )
        )
        target = groups[keys[0]]
        for k in keys[1:]:
            g = groups.pop(k)
            target["videos"].extend(g["videos"])
            if len(g["name"]) > len(target["name"]):
                target["name"] = g["name"]

    # slugs: âncoras primeiro (donas do próprio slug), depois novos.
    out: dict[str, dict] = {}
    ordered = sorted(
        groups.values(),
        key=lambda g: (not anchors(g), sorted(anchors(g)) or [""], norm(g["base"])),
    )
    for g in ordered:
        _finalize(g)
        a = anchors(g)
        slug = min(a) if a else slugify(g["name"] or g["base"])
        # colisão improvável de slug: sufixa com a base
        if slug in out:
            slug = f"{slug}-{slugify(g['base'])[:24]}"
        out[slug] = g
    return out

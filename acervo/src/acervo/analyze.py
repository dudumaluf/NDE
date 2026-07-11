"""Análise do corpus (doc 02 §8): embeddings → UMAP 3D/2D → clusters →
grafo kNN → co-ocorrências → clustering dos motivos emergentes.

Tudo local (sentence-transformers no MPS/CPU do Mac). Determinístico via
`analyze.umap_random_state`. Resultados em data/analysis/.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

import numpy as np

from .config import AcervoConfig
from .people import list_people
from .schema import Person

ANALYSIS_VERSION = 1


def analysis_dir(cfg: AcervoConfig) -> Path:
    d = cfg.data_dir() / "analysis"
    d.mkdir(parents=True, exist_ok=True)
    return d


# ── embeddings ────────────────────────────────────────────────────────────

_model_cache: dict[str, Any] = {}


def get_model(cfg: AcervoConfig):
    name = cfg.embeddings.model
    if name not in _model_cache:
        from sentence_transformers import SentenceTransformer

        _model_cache[name] = SentenceTransformer(name)
    return _model_cache[name]


def person_document(p: Person) -> str:
    """Representação semântica da história (cabe no contexto do bge-m3)."""
    parts = [p.summary.one_liner, p.summary.short]
    parts += [f"{e.key}" for e in p.elements]
    parts += [q.text for e in p.elements for q in e.quotes]
    parts += [m.label for m in p.emergent_motifs]
    return "\n".join(x for x in parts if x)[:24000]


def embed_people(cfg: AcervoConfig, persons: list[Person]) -> np.ndarray:
    model = get_model(cfg)
    docs = [person_document(p) for p in persons]
    return np.asarray(model.encode(docs, normalize_embeddings=True, show_progress_bar=False))


def embed_texts(cfg: AcervoConfig, texts: list[str]) -> np.ndarray:
    model = get_model(cfg)
    return np.asarray(model.encode(texts, normalize_embeddings=True, show_progress_bar=False))


# ── layout / clusters / grafo ────────────────────────────────────────────


def umap_layout(emb: np.ndarray, n_components: int, seed: int) -> np.ndarray:
    import umap

    n = len(emb)
    reducer = umap.UMAP(
        n_components=n_components,
        n_neighbors=max(3, min(8, n - 1)),
        min_dist=0.35,
        metric="cosine",
        random_state=seed,
    )
    out = reducer.fit_transform(emb)
    # normaliza para [-1, 1] por eixo (o app escala como quiser)
    out = out - out.mean(axis=0)
    span = np.abs(out).max(axis=0)
    span[span == 0] = 1
    return out / span


def cluster_people(emb: np.ndarray, seed: int) -> np.ndarray:
    """Agrupamento com fallback: HDBSCAN se disponível, senão Agglomerative."""
    n = len(emb)
    try:
        from sklearn.cluster import HDBSCAN  # sklearn>=1.3 tem HDBSCAN nativo

        labels = HDBSCAN(min_cluster_size=max(2, n // 8), metric="cosine").fit_predict(emb)
    except Exception:  # noqa: BLE001
        from sklearn.cluster import AgglomerativeClustering

        k = max(2, round(np.sqrt(n / 2)))
        labels = AgglomerativeClustering(n_clusters=k, metric="cosine", linkage="average").fit_predict(emb)
    # HDBSCAN pode marcar tudo -1 (ruído) em N pequeno → fallback aglomerativo
    if (np.asarray(labels) == -1).all():
        from sklearn.cluster import AgglomerativeClustering

        k = max(2, round(np.sqrt(n / 2)))
        labels = AgglomerativeClustering(n_clusters=k, metric="cosine", linkage="average").fit_predict(emb)
    return np.asarray(labels)


def knn_graph(persons: list[Person], emb: np.ndarray, k: int) -> list[dict]:
    sims = emb @ emb.T
    np.fill_diagonal(sims, -1)
    edges: dict[tuple[int, int], dict] = {}
    el_sets = [{e.key for e in p.elements} for p in persons]
    for i in range(len(persons)):
        for j in np.argsort(-sims[i])[: max(1, k)]:
            j = int(j)
            a, b = min(i, j), max(i, j)
            if (a, b) in edges:
                continue
            shared = sorted(el_sets[a] & el_sets[b])
            weight = float(sims[a][b]) + 0.02 * len(shared)
            edges[(a, b)] = {
                "source": persons[a].id,
                "target": persons[b].id,
                "weight": round(weight, 4),
                "similarity": round(float(sims[a][b]), 4),
                "shared_elements": shared[:12],
            }
    return sorted(edges.values(), key=lambda e: -e["weight"])


def cooccurrence(persons: list[Person]) -> dict:
    keys = sorted({e.key for p in persons for e in p.elements})
    idx = {k: i for i, k in enumerate(keys)}
    m = np.zeros((len(keys), len(keys)), dtype=int)
    for p in persons:
        ks = [e.key for e in p.elements]
        for a in ks:
            for b in ks:
                m[idx[a]][idx[b]] += 1
    counts = {k: int(m[idx[k]][idx[k]]) for k in keys}
    cond: dict[str, dict[str, float]] = {}
    for a in keys:
        cond[a] = {}
        for b in keys:
            if a != b and counts[a] >= 4:
                cond[a][b] = round(m[idx[a]][idx[b]] / counts[a], 3)
    return {"keys": keys, "counts": counts, "given": cond}


# ── motivos emergentes → temas ────────────────────────────────────────────


def cluster_motifs(cfg: AcervoConfig, persons: list[Person], seed: int) -> list[dict]:
    """Agrupa os motivos da passada aberta por similaridade semântica."""
    rows = []
    for p in persons:
        for m in p.emergent_motifs:
            text = m.label.replace("_", " ")
            if m.quotes:
                text += ": " + m.quotes[0].text[:220]
            rows.append({"person": p.id, "label": m.label, "text": text})
    if len(rows) < 6:
        return []

    emb = embed_texts(cfg, [r["text"] for r in rows])
    from sklearn.cluster import AgglomerativeClustering

    clus = AgglomerativeClustering(
        n_clusters=None, distance_threshold=0.55, metric="cosine", linkage="average"
    ).fit_predict(emb)

    themes: dict[int, dict] = {}
    for r, c in zip(rows, clus):
        t = themes.setdefault(int(c), {"labels": [], "people": set()})
        t["labels"].append(r["label"])
        t["people"].add(r["person"])
    out = []
    for c, t in themes.items():
        if len(t["people"]) < 2:
            continue  # tema só vira tema se atravessa pessoas
        common = Counter(t["labels"]).most_common(3)
        out.append(
            {
                "id": int(c),
                "size": len(t["labels"]),
                "people": sorted(t["people"]),
                "top_labels": [label for label, _ in common],
            }
        )
    return sorted(out, key=lambda x: -len(x["people"]))


# ── nomeação de clusters via LLM ─────────────────────────────────────────


def name_clusters(cfg: AcervoConfig, persons: list[Person], labels: np.ndarray) -> dict[int, str]:
    from .extract import call_with_repair, split_prompt

    ids = sorted({int(l) for l in labels if l >= 0})
    if not ids:
        return {}
    blocks = []
    for cid in ids:
        members = [p for p, l in zip(persons, labels) if l == cid]
        sample = "\n".join(
            f"  - {p.person.display_name}: {p.summary.one_liner[:160]}" for p in members[:5]
        )
        blocks.append(f"Cluster {cid} ({len(members)} pessoas):\n{sample}")
    md = (cfg.root / "prompts" / "name_clusters.md").read_text(encoding="utf-8")
    system, user = split_prompt(md)
    user = user.format(clusters_block="\n\n".join(blocks))
    try:
        data, _ = call_with_repair(cfg, system, user)
        return {int(c["id"]): str(c["label"])[:80] for c in data.get("clusters", [])}
    except Exception:  # noqa: BLE001 — nome é cosmético; nunca derruba o analyze
        return {}


# ── orquestração ─────────────────────────────────────────────────────────


def run_analysis(cfg: AcervoConfig, with_names: bool = True) -> dict:
    persons = [p for p in list_people(cfg) if p.status in ("extracted", "reviewed", "exported")]
    if len(persons) < 4:
        raise RuntimeError("análise precisa de pelo menos 4 pessoas extraídas")
    seed = cfg.analyze.umap_random_state

    emb = embed_people(cfg, persons)
    u3 = umap_layout(emb, 3, seed)
    u2 = umap_layout(emb, 2, seed)
    labels = cluster_people(emb, seed)
    edges = knn_graph(persons, emb, cfg.analyze.knn_k)
    cooc = cooccurrence(persons)
    motif_themes = cluster_motifs(cfg, persons, seed)
    names = name_clusters(cfg, persons, labels) if with_names else {}

    result = {
        "analysis_version": ANALYSIS_VERSION,
        "model": cfg.embeddings.model,
        "seed": seed,
        "people": [
            {
                "id": p.id,
                "cluster": int(labels[i]),
                "umap3d": [round(float(x), 4) for x in u3[i]],
                "umap2d": [round(float(x), 4) for x in u2[i]],
            }
            for i, p in enumerate(persons)
        ],
        "clusters": [
            {
                "id": int(c),
                "label": names.get(int(c), f"núcleo {c}"),
                "size": int((labels == c).sum()),
                "members": [p.id for p, l in zip(persons, labels) if l == c],
            }
            for c in sorted({int(l) for l in labels})
        ],
        "edges": edges,
        "cooccurrence": cooc,
        "motif_themes": motif_themes,
    }
    (analysis_dir(cfg) / "analysis.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    np.save(analysis_dir(cfg) / "embeddings.npy", emb)
    return result

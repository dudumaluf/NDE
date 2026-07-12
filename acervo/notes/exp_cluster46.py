"""Iteração de clustering do lote 2 (46 pessoas) sobre embeddings salvos.

O analyze salvou data/analysis/embeddings.npy como hstack([0.4*text, 0.6*sig])
(text = 1024 dims bge-m3 normalizado; sig = IDF de elementos, 44 dims).
Aqui des-escalamos e re-ponderamos sem re-encodar — barato.

Uso: uv run python notes/exp_cluster46.py
"""

import json
import sys
from collections import Counter
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sklearn.cluster import HDBSCAN, AgglomerativeClustering  # noqa: E402
from sklearn.metrics import silhouette_score  # noqa: E402

root = Path(__file__).parent.parent
emb = np.load(root / "data/analysis/embeddings.npy")
analysis = json.loads((root / "data/analysis/analysis.json").read_text())
ids = [p["id"] for p in analysis["people"]]
n = len(ids)

TEXT_DIMS = 1024
text = emb[:, :TEXT_DIMS] / 0.4
sig = emb[:, TEXT_DIMS:] / 0.6


def report(tag, labels):
    labels = np.asarray(labels)
    noise = int((labels < 0).sum())
    valid = labels[labels >= 0]
    ks = sorted(set(valid.tolist()))
    sizes = Counter(valid.tolist())
    big = sizes.most_common(1)[0][1] if ks else 0
    sil = float("nan")
    mask = labels >= 0
    if len(ks) > 1 and mask.sum() > len(ks):
        sil = silhouette_score(emb_cur[mask], labels[mask], metric="cosine")
    print(
        f"{tag:42s} k={len(ks)} noise={noise:2d}/{n} "
        f"maior={big:2d} ({big/n:.0%}) sil={sil:.3f} "
        f"tamanhos={sorted(sizes.values(), reverse=True)}"
    )
    return sil, noise, big


for wt, ws in [(0.4, 0.6), (0.5, 0.5), (0.3, 0.7), (0.6, 0.4)]:
    emb_cur = np.hstack([wt * text, ws * sig])
    print(f"\n=== pesos texto/{wt} sig/{ws} ===")
    for mcs in (3, 4, 5):
        labels = HDBSCAN(min_cluster_size=mcs, metric="cosine").fit_predict(emb_cur)
        report(f"HDBSCAN mcs={mcs}", labels)
    for k in range(3, 11):
        labels = AgglomerativeClustering(
            n_clusters=k, metric="cosine", linkage="average"
        ).fit_predict(emb_cur)
        report(f"Agglo k={k}", labels)

"""Experimento A/B de representações para clustering fenomenológico.

Variantes:
  A: 40% texto completo (summaries+quotes+motifs) + 60% assinatura IDF  [baseline]
  B: 40% só a VOZ DA DEPOENTE (segments do main_speaker) + 60% IDF
  C: 40% só os BEATS DE EQM (summaries) + quotes + 60% IDF
  D: 100% assinatura IDF de elementos
  E: 100% texto da depoente

Métrica: silhouette (melhor k 3..6) + inspeção qualitativa dos pares.
Uso: uv run python notes/exp_embeddings.py
"""

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from acervo.analyze import _agglomerative, element_signature, get_model  # noqa: E402
from acervo.config import load_config  # noqa: E402
from acervo.people import list_people  # noqa: E402

cfg = load_config()
persons = [p for p in list_people(cfg) if p.status in ("extracted", "reviewed")]
model = get_model(cfg)


def enc(texts):
    return np.asarray(model.encode(texts, normalize_embeddings=True, show_progress_bar=False))


def depoente_text(p, max_chars=24000):
    chunks = []
    for s in p.sources:
        tp = cfg.data_dir() / s.video_id / "transcript.json"
        if not tp.exists():
            continue
        t = json.loads(tp.read_text(encoding="utf-8"))
        main = t.get("main_speaker")
        if not main:
            continue
        chunks += [seg["text"] for seg in t.get("segments", []) if seg.get("speaker") == main]
    return " ".join(chunks)[:max_chars]


def eqm_text(p, max_chars=24000):
    parts = [b.summary for b in p.beats if b.type in ("eqm", "evento_morte", "retorno")]
    parts += [q.text for e in p.elements for q in e.quotes]
    return "\n".join(parts)[:max_chars]


def full_text(p, max_chars=24000):
    parts = [p.summary.one_liner, p.summary.short]
    parts += [e.key for e in p.elements]
    parts += [q.text for e in p.elements for q in e.quotes]
    parts += [m.label for m in p.emergent_motifs]
    return "\n".join(x for x in parts if x)[:max_chars]


sig = element_signature(persons)
texts = {
    "A_full": enc([full_text(p) for p in persons]),
    "B_depoente": enc([depoente_text(p) for p in persons]),
    "C_eqm": enc([eqm_text(p) for p in persons]),
}

variants = {
    "A (full+IDF 40/60)": np.hstack([0.4 * texts["A_full"], 0.6 * sig]),
    "B (depoente+IDF 40/60)": np.hstack([0.4 * texts["B_depoente"], 0.6 * sig]),
    "C (eqm+IDF 40/60)": np.hstack([0.4 * texts["C_eqm"], 0.6 * sig]),
    "C2 (eqm+IDF 60/40)": np.hstack([0.6 * texts["C_eqm"], 0.4 * sig]),
    "D (IDF puro)": sig,
    "E (depoente puro)": texts["B_depoente"],
    "F (eqm puro)": texts["C_eqm"],
}

from sklearn.metrics import silhouette_score  # noqa: E402

names = [p.id.split("-")[0] for p in persons]
for label, emb in variants.items():
    best_k, best_s, best_labels = None, -2, None
    for k in range(3, 7):
        ls = _agglomerative(emb, k)
        from collections import Counter

        if Counter(ls).most_common(1)[0][1] > 0.7 * len(persons):
            continue
        s = silhouette_score(emb, ls, metric="cosine")
        if s > best_s:
            best_k, best_s, best_labels = k, s, ls
    groups = {}
    if best_labels is not None:
        for n, l in zip(names, best_labels):
            groups.setdefault(int(l), []).append(n)
    print(f"\n== {label}  k={best_k}  silhouette={best_s:.3f}")
    for gid, members in sorted(groups.items()):
        print(f"   [{gid}] {', '.join(members)}")

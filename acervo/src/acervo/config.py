"""Configuração (doc 02 req. 3): acervo.config.yaml + segredos no .env."""

from __future__ import annotations

from pathlib import Path

import yaml
from dotenv import load_dotenv
from pydantic import BaseModel


class ChannelCfg(BaseModel):
    url: str = ""


class PathsCfg(BaseModel):
    data: str = "data"
    export: str = "export"
    db: str = "acervo.db"


class FetchCfg(BaseModel):
    audio_format: str = "m4a"


class TranscribeCfg(BaseModel):
    backend: str = "fal"
    model: str = "fal-ai/wizper"
    language: str = "pt"
    chunk_level: str = "word"
    diarize: bool = False


class ExtractCfg(BaseModel):
    backend: str = "fal"
    model: str = ""
    max_retries: int = 2


class EmbeddingsCfg(BaseModel):
    backend: str = "local"
    model: str = "intfloat/multilingual-e5-large"


class AnalyzeCfg(BaseModel):
    umap_random_state: int = 42
    knn_k: int = 8


class AcervoConfig(BaseModel):
    channel: ChannelCfg = ChannelCfg()
    paths: PathsCfg = PathsCfg()
    fetch: FetchCfg = FetchCfg()
    transcribe: TranscribeCfg = TranscribeCfg()
    extract: ExtractCfg = ExtractCfg()
    embeddings: EmbeddingsCfg = EmbeddingsCfg()
    analyze: AnalyzeCfg = AnalyzeCfg()

    # raiz do projeto (pasta que contém o acervo.config.yaml)
    root: Path = Path(".")

    def data_dir(self) -> Path:
        return self.root / self.paths.data

    def db_path(self) -> Path:
        return self.root / self.paths.db


def find_root(start: Path | None = None) -> Path:
    """Sobe diretórios até achar acervo.config.yaml (permite rodar de qualquer cwd)."""
    cur = (start or Path.cwd()).resolve()
    for candidate in [cur, *cur.parents]:
        if (candidate / "acervo.config.yaml").exists():
            return candidate
    raise FileNotFoundError(
        "acervo.config.yaml não encontrado — rode dentro da pasta do acervo."
    )


def load_config(start: Path | None = None) -> AcervoConfig:
    root = find_root(start)
    load_dotenv(root / ".env")  # segredos (FAL_KEY etc.) entram no ambiente
    raw = yaml.safe_load((root / "acervo.config.yaml").read_text(encoding="utf-8")) or {}
    cfg = AcervoConfig.model_validate(raw)
    cfg.root = root
    return cfg

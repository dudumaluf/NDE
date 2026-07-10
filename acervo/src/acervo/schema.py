"""Schema do documento central `person.json` (doc 02 §6, estendido pelos
achados do piloto — ver notes/fichas-piloto.md e STATUS):

- uma PESSOA agrega N vídeos (partes "1/3, 2/3…");
- beats e quotes referenciam `video_id` + timestamps locais (os cortes de
  áudio são por vídeo);
- `adjacent_tags` para fenômenos da biografia espiritual fora da EQM nuclear;
- `report_epistemology` (como a memória chegou ao relato);
- `related_interviews` para pessoas recorrentes no canal (ex.: Gilson, 3ª).
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

SCHEMA_VERSION = 1

BeatType = Literal["contexto", "evento_morte", "eqm", "retorno", "integracao", "outro"]
Valence = Literal["positiva", "angustiante", "mista"]
Epistemology = Literal["direto", "meditacao", "lido", "reconstruido", "nao_avaliado"]
CauseCategory = Literal[
    "acidente",
    "cirurgia",
    "parada_cardiaca",
    "doenca",
    "afogamento",
    "outro",
    "nao_informado",
]


class Quote(BaseModel):
    video_id: str
    start: float | None = None
    end: float | None = None
    text: str


class ElementHit(BaseModel):
    key: str
    canonical: bool = True
    confidence: float = Field(ge=0, le=1)
    quotes: list[Quote] = []


class EmergentMotif(BaseModel):
    label: str
    quotes: list[Quote] = []


class Beat(BaseModel):
    video_id: str
    type: BeatType
    start: float
    end: float
    summary: str


class SourceVideo(BaseModel):
    video_id: str
    part: int = 1
    parts_total: int = 1
    url: str
    title: str
    published_at: str | None = None
    duration_s: float | None = None


class PersonMeta(BaseModel):
    display_name: str
    anonymized: bool = False
    age_at_event: int | None = None
    cause_category: CauseCategory = "nao_informado"


class Summary(BaseModel):
    one_liner: str = ""
    short: str = ""


class Tone(BaseModel):
    valence: Valence = "mista"
    notes: str = ""


class Review(BaseModel):
    reviewed_by: str | None = None
    reviewed_at: str | None = None
    locked_fields: list[str] = []


class Person(BaseModel):
    schema_version: int = SCHEMA_VERSION
    id: str  # slug estável (ex.: "carmen-martins")
    status: Literal["grouped", "extracted", "reviewed", "exported"] = "grouped"
    channel: str = ""
    sources: list[SourceVideo] = []
    person: PersonMeta
    beats: list[Beat] = []
    elements: list[ElementHit] = []
    emergent_motifs: list[EmergentMotif] = []
    adjacent_tags: list[str] = []
    summary: Summary = Summary()
    tone: Tone = Tone()
    report_epistemology: Epistemology = "nao_avaliado"
    related_interviews: list[str] = []
    needs_attention: list[str] = []
    review: Review = Review()


# ── Saída da extração POR VÍDEO (intermediária, cacheável) ────────────────


class VideoExtraction(BaseModel):
    schema_version: int = SCHEMA_VERSION
    video_id: str
    model: str
    prompt_version: str
    beats: list[Beat] = []
    elements: list[ElementHit] = []
    emergent_motifs: list[EmergentMotif] = []
    adjacent_tags: list[str] = []
    summary_short: str = ""
    tone: Tone = Tone()
    age_at_event: int | None = None
    cause_category: CauseCategory = "nao_informado"
    epistemology: Epistemology = "nao_avaliado"
    quotes_rejected: int = 0
    usage: dict = {}

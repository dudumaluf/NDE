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

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

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


class Demographics(BaseModel):
    """Metadados demográficos declarados no vídeo (passada complementar barata).

    Tudo opcional: só o que a pessoa declara explicitamente — nunca inferido,
    exceto `sexo`, que pode vir do contexto do relato/nome (fonte marcada)."""

    sexo: Literal["feminino", "masculino"] | None = None
    sexo_fonte: Literal["declarado", "inferido_contexto"] | None = None
    religiao_contexto: str | None = None
    local_evento: str | None = None
    local_origem: str | None = None
    ano_evento: int | None = None
    tempo_clinico_declarado: str | None = None
    tempo_subjetivo_declarado: str | None = None
    profissao: str | None = None

    # Tolerância a saídas imperfeitas do LLM (modelo barato):
    @field_validator("sexo", mode="before")
    @classmethod
    def _coerce_sexo(cls, v: object) -> str | None:
        s = str(v or "").strip().lower()
        if s.startswith(("f", "mulher")):
            return "feminino"
        if s.startswith(("m", "homem")) and not s.startswith("mulher"):
            return "masculino"
        return None

    @field_validator("sexo_fonte", mode="before")
    @classmethod
    def _coerce_sexo_fonte(cls, v: object) -> str | None:
        s = str(v or "").strip().lower()
        if s.startswith("declarad"):
            return "declarado"
        if s.startswith("inferid"):
            return "inferido_contexto"
        return None

    @field_validator("ano_evento", mode="before")
    @classmethod
    def _coerce_ano(cls, v: object) -> int | None:
        if v is None:
            return None
        m = re.search(r"\b(19|20)\d{2}\b", str(v))
        return int(m.group()) if m else None

    @field_validator(
        "religiao_contexto",
        "local_evento",
        "local_origem",
        "tempo_clinico_declarado",
        "tempo_subjetivo_declarado",
        "profissao",
        mode="before",
    )
    @classmethod
    def _coerce_texto(cls, v: object) -> str | None:
        if v is None:
            return None
        s = str(v).strip()
        low = s.lower()
        if not s or low in {"null", "none", "nao informado", "não informado", "n/a"}:
            return None
        return s[:200]

    @model_validator(mode="after")
    def _fonte_exige_sexo(self) -> "Demographics":
        if self.sexo is None:
            self.sexo_fonte = None
        elif self.sexo_fonte is None:
            self.sexo_fonte = "inferido_contexto"
        return self


def _coerce_valence_int(v: object) -> int | None:
    """Valência inteira -2..+2, tolerante a '+2', '-1.0', 'null' (modelo barato)."""
    if v is None:
        return None
    m = re.search(r"[+-]?\d+", str(v))
    if not m:
        return None
    return max(-2, min(2, int(m.group())))


class BeatEmotion(BaseModel):
    """Valência emocional de UM beat (alinhado por índice a Person.beats)."""

    beat_index: int
    valence: int = Field(ge=-2, le=2)
    label: str = ""  # 1-3 palavras pt ("medo e dor", "paz absoluta")

    @field_validator("valence", mode="before")
    @classmethod
    def _coerce_valence(cls, v: object) -> int:
        return _coerce_valence_int(v) or 0

    @field_validator("label", mode="before")
    @classmethod
    def _coerce_label(cls, v: object) -> str:
        return str(v or "").strip()[:60]


class ArcEndpoint(BaseModel):
    """Como a pessoa estava ANTES do evento / o que se tornou DEPOIS."""

    resumo: str = ""
    valence: int | None = Field(default=None, ge=-2, le=2)

    @field_validator("resumo", mode="before")
    @classmethod
    def _coerce_resumo(cls, v: object) -> str:
        return str(v or "").strip()[:300]

    @field_validator("valence", mode="before")
    @classmethod
    def _coerce_valence(cls, v: object) -> int | None:
        return _coerce_valence_int(v)


class Arc(BaseModel):
    """Arco emocional da história (passada complementar barata, 1 chamada/pessoa).

    `beats_emotion` é alinhada 1:1 aos beats existentes (mesma ordem/índice);
    `virada` é o beat_index do ponto de virada emocional (geralmente a EQM)."""

    beats_emotion: list[BeatEmotion] = []
    entrada: ArcEndpoint = ArcEndpoint()
    saida: ArcEndpoint = ArcEndpoint()
    virada: int | None = None

    @field_validator("virada", mode="before")
    @classmethod
    def _coerce_virada(cls, v: object) -> int | None:
        if v is None:
            return None
        m = re.search(r"\d+", str(v))
        return int(m.group()) if m else None


class TimelinePart(BaseModel):
    video_id: str
    offset_s: float = 0.0  # início desta parte no tempo global da história
    duration_s: float = 0.0


class Timeline(BaseModel):
    """Timeline normalizada da história (derivação local, recomputável):
    duração total = soma das partes na ordem; t_norm de beats/quotes =
    (offset da parte + start local) / total_s."""

    total_s: float = 0.0
    parts: list[TimelinePart] = []


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
    demographics: Demographics = Demographics()
    demographics_version: str | None = None  # cache da passada demográfica
    arc: Arc = Arc()
    arc_version: str | None = None  # cache da passada de arco emocional
    timeline_norm: Timeline = Timeline()  # derivado local, recomputável
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

    # Tolerância a saídas imperfeitas do LLM (ex.: "13 anos", "~13"):
    @field_validator("age_at_event", mode="before")
    @classmethod
    def _coerce_age(cls, v: object) -> int | None:
        if v is None or isinstance(v, int):
            return v
        m = re.search(r"\d{1,3}", str(v))
        return int(m.group()) if m else None

    @field_validator("cause_category", mode="before")
    @classmethod
    def _coerce_cause(cls, v: object) -> str:
        valid = {
            "acidente", "cirurgia", "parada_cardiaca", "doenca",
            "afogamento", "outro", "nao_informado",
        }
        s = str(v or "nao_informado").strip().lower()
        return s if s in valid else "outro" if s else "nao_informado"

    @field_validator("epistemology", mode="before")
    @classmethod
    def _coerce_epistemology(cls, v: object) -> str:
        valid = {"direto", "meditacao", "lido", "reconstruido", "nao_avaliado"}
        s = str(v or "nao_avaliado").strip().lower()
        return s if s in valid else "nao_avaliado"

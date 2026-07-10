# Briefing de Implementação — `acervo` (Pipeline de Dados)

> **Para:** Claude Code / Cursor. **Pré-requisito de leitura:** `docs/00-visao-geral.md` (contexto do projeto).
> **Objetivo:** construir uma ferramenta CLI (+ UI local de revisão) que transforma os vídeos do canal *"Afinal, o que somos nós?"* em um dataset padronizado, versionado, revisável e pronto para ser consumido pela experiência 3D (doc 03).
> **Método de trabalho:** implementar por marcos (seção 12), um por vez, com commit por marco. Não avançar sem os critérios de aceite passarem.

---

## 1. Resumo executivo

O `acervo` é um pipeline em estágios: **scan → fetch → transcribe → extract → review → analyze → export**. Cada estágio lê o estado atual, processa apenas o que falta, e grava resultados validados por schema. O produto final é uma pasta `export/` autocontida que a experiência 3D carrega sem conhecer nada do pipeline. Um humano (o criador do projeto) revisa e corrige as extrações numa UI local antes de qualquer coisa ir para o export.

## 2. Requisitos não-negociáveis

1. **Incremental e idempotente.** Rodar de novo nunca refaz trabalho pronto. `acervo scan` detecta vídeos novos do canal e só eles entram na fila.
2. **Resumível.** Se falhar no vídeo 37 de 200, a próxima execução retoma do 37. Estado de cada item persistido (SQLite).
3. **Config-driven.** Tudo em `acervo.config.yaml`: canal, modelos, paths, limites. Chaves de API via `.env` (nunca commitadas).
4. **Custo previsível.** Qualquer comando que chame LLM aceita `--dry-run` e imprime estimativa de tokens/custo antes. Cache agressivo de respostas LLM (keyed por hash do input + versão do prompt).
5. **Schema como contrato.** Todo JSON validado por Pydantic. Campo `schema_version` em tudo. Mudou o schema → migração explícita, nunca quebra silenciosa.
6. **Human-in-the-loop.** Nada entra no `export/` sem status `reviewed`, exceto com flag explícita `--allow-unreviewed` (para prototipagem).
7. **Citações literais.** Toda quote extraída pelo LLM é validada como substring (normalizada) do transcript real. Quote que não bate = rejeitada e logada. O pipeline **nunca inventa dados** (princípio 5 do doc 00).
8. **Local-first.** Roda inteiro numa máquina pessoal. GPU opcional (acelera Whisper), nunca obrigatória.

## 3. Stack sugerida

> **Decisão de infra (2026-07-10, ver STATUS):** concentrar os estágios pagos
> no **fal.ai** (créditos já existentes do Dudu). Transcrição default =
> `fal-ai/wizper` (Whisper v3 Large, `language: pt`, `chunk_level: word`,
> diarização integrada por flag — dispensa pyannote local). Extração default =
> `fal-ai/any-llm` com modelo frontier. Backends **plugáveis por config**:
> `faster-whisper` local e API Anthropic direta continuam como alternativas
> (fallback de custo zero / plano B de qualidade). Todo o resto roda local.

- Python 3.11+, gerenciado com `uv`
- CLI: `typer` · Config: `pydantic-settings` + YAML
- Download: `yt-dlp` (áudio m4a/opus + metadata + thumbnail)
- Transcrição: `fal-ai/wizper` via `fal-client` (default) ou `faster-whisper` local (modelo large-v3, língua `pt`, word timestamps)
- Diarização (opcional, flag): `diarize=true` do wizper (default) ou `pyannote.audio` local — separar entrevistador × depoente
- Extração estruturada: `fal-ai/any-llm` com modelo frontier (default) ou API do Claude (modelo configurável), prompts versionados em `prompts/*.md`
- Embeddings: plugável via interface única — default local `intfloat/multilingual-e5-large` (sentence-transformers); alternativa API (Voyage/OpenAI) por config
- Análise: `umap-learn`, `hdbscan`, `networkx`, `numpy`
- Áudio (cortes): `ffmpeg` via subprocess, com loudness normalization (`loudnorm`)
- Estado: SQLite (`acervo.db`) para status/fila; **dados canônicos em JSON no filesystem** (git-friendly, inspecionável)
- UI de revisão: FastAPI + frontend Vite/React mínimo, servida por `acervo review` (M4)

## 4. Layout do repositório

```
acervo/
  acervo.config.yaml
  .env.example
  prompts/                # prompts LLM versionados (são código!)
    extract_closed.md
    extract_open.md
    name_clusters.md
  taxonomy.yaml           # taxonomia canônica de elementos (editável)
  src/acervo/             # pacote python
  data/                   # dados canônicos (por vídeo)
    <video_id>/
      meta.json
      audio.m4a
      transcript.json
      person.json         # o documento central (schema seção 6)
  export/                 # produto final (seção 10) — regenerável
  docs/
```

## 5. Estágios e comandos

| Comando | O que faz | Saída |
|---|---|---|
| `acervo scan` | Lista todos os vídeos do canal (`yt-dlp --flat-playlist`), registra novos no DB | fila atualizada |
| `acervo fetch [--all\|id]` | Baixa áudio + metadata dos pendentes | `data/<id>/audio.m4a`, `meta.json` |
| `acervo transcribe` | Whisper com timestamps por palavra; normalização leve de texto | `transcript.json` |
| `acervo diarize` | (opcional) marca speaker por segmento | atualiza `transcript.json` |
| `acervo extract` | LLM estrutura o relato → beats, elementos, quotes, resumos (seção 7) | `person.json` (status `extracted`) |
| `acervo review` | Sobe UI local de revisão/edição (seção 9) | status `reviewed` |
| `acervo analyze` | Embeddings, UMAP, clusters, grafo, co-ocorrência (seção 8) | campos `derived` + arquivos agregados |
| `acervo export` | Gera `export/` completo + cortes de áudio | `export/` |
| `acervo report` | Relatório HTML do corpus (stats, erros, cobertura) | `report.html` |
| `acervo run --all` | Orquestra scan→…→export para tudo pendente | — |

## 6. O Schema — `person.json` (v1)

O documento central. Um por vídeo/depoimento.

```json
{
  "schema_version": 1,
  "id": "yt_dQw4w9WgXcQ",
  "status": "raw | fetched | transcribed | extracted | reviewed | exported",
  "source": {
    "video_id": "dQw4w9WgXcQ",
    "url": "https://youtube.com/watch?v=...",
    "title": "…",
    "published_at": "2023-05-01",
    "duration_s": 1840,
    "channel": "Afinal, o que somos nós?"
  },
  "person": {
    "display_name": "Maria",
    "anonymized": false,
    "age_at_event": 34,
    "cause_category": "acidente | cirurgia | parada_cardiaca | doenca | afogamento | outro | nao_informado"
  },
  "transcript_ref": "transcript.json",
  "beats": [
    { "type": "contexto",   "start": 0.0,   "end": 145.2,  "summary": "…" },
    { "type": "evento_morte","start": 145.2, "end": 210.0,  "summary": "…" },
    { "type": "eqm",        "start": 210.0, "end": 1100.5, "summary": "…" },
    { "type": "retorno",    "start": 1100.5,"end": 1300.0, "summary": "…" },
    { "type": "integracao", "start": 1300.0,"end": 1840.0, "summary": "…" }
  ],
  "elements": [
    {
      "key": "tunel",
      "canonical": true,
      "confidence": 0.92,
      "quotes": [ { "start": 312.4, "end": 331.0, "text": "aí eu vi tipo um corredor de luz…" } ]
    }
  ],
  "emergent_motifs": [
    { "label": "descreve cores inexistentes", "quotes": [ … ] }
  ],
  "summary": { "one_liner": "…", "short": "… (2-3 frases)" },
  "tone": { "valence": "positiva | angustiante | mista", "notes": "…" },
  "embeddings": { "story": "emb_story.npy", "beats": "emb_beats.npy" },
  "derived": {
    "cluster_id": 3,
    "cluster_label": "Os que escolheram voltar",
    "umap3d": [0.42, 0.0, -1.31],
    "umap2d": [0.11, 0.87],
    "neighbors": [ { "id": "yt_…", "weight": 0.83, "shared_elements": ["tunel","paz"] } ]
  },
  "review": { "reviewed_by": null, "reviewed_at": null, "locked_fields": [] }
}
```

Regras: beats cobrem o áudio sem sobreposição e podem repetir tipo (relatos não-lineares existem); nem toda pessoa tem os 5 tipos; `quotes[].text` precisa validar como substring do transcript; campos em `locked_fields` nunca são sobrescritos por reprocessamento.

## 7. Extração via LLM (duas passadas)

**Passada fechada** (`extract_closed.md`): recebe transcript + `taxonomy.yaml`; só pode marcar elementos existentes na taxonomia; devolve beats, elements com quotes/confidence, summary, tone, person (dados que a própria pessoa declara no vídeo). Saída JSON estrita → validação Pydantic → retry com reparo em caso de erro (máx. 2 tentativas, depois marca `needs_attention`).

**Passada aberta** (`extract_open.md`): "o que se repete neste relato que a taxonomia não cobre?" → `emergent_motifs`. Periodicamente, motivos frequentes no corpus são promovidos a elementos canônicos (edição manual do `taxonomy.yaml` + comando `acervo migrate-taxonomy` que re-mapeia).

Transcripts longos: se exceder a janela de contexto configurada, dividir por capítulos com overlap e mesclar resultados (dedupe de elementos por key, união de quotes).

## 8. Análise (`acervo analyze`)

1. Embedding por história (texto completo normalizado) e por beat.
2. **UMAP 3D** (layout do Campo) e **2D** (constelação) — `random_state` fixo em config para determinismo; recalcular layout é decisão explícita (`--relayout`), pois muda o mundo.
3. **HDBSCAN** sobre embeddings → clusters; LLM nomeia cada cluster lendo 5 resumos amostrados (`name_clusters.md`), nomes revisáveis na UI.
4. **Grafo:** kNN por embedding (k configurável) com peso reforçado por elementos compartilhados; arestas guardam `shared_elements` (a experiência usa isso nos fios).
5. **Co-ocorrência** de elementos (matriz + estatísticas tipo "% de X dado Y") → `stats.json` (alimenta o modo constelação).

## 9. UI de revisão (`acervo review`)

Funcionalidade mínima que importa:
- Lista de pessoas filtrável por status; abrir uma pessoa mostra: player de áudio com waveform, marcadores clicáveis de beats e quotes (clicou → toca daquele ponto), painel de elementos (adicionar/remover/editar timestamps arrastando), resumos editáveis.
- Botões: **Aprovar** (→ `reviewed`), **Reprocessar** (re-extract preservando `locked_fields`), **Anonimizar** (limpa `display_name`, marca flag).
- Toda edição manual adiciona o campo a `locked_fields` automaticamente.

## 10. Export (`export/`) — o contrato com a experiência

```
export/
  manifest.json        # version, gerado_em, contagens, hash do conteúdo
  taxonomy.json        # elementos canônicos com labels/descrições PT
  people/<id>.json     # subset público do person.json (sem paths internos, respeitando anonimização)
  layout.json          # { id: {umap3d, umap2d, cluster_id} }
  graph.json           # arestas com weight + shared_elements
  clusters.json        # id, label, size, elementos dominantes
  stats.json           # co-ocorrências e agregados para a constelação
  audio/<id>/
    beat_contexto.mp3, beat_evento_morte.mp3, …   # cortes por beat
    q_<element>_<n>.mp3                            # cortes por quote
    whisper.mp3                                    # trecho curto low-volume p/ sussurro espacial
```

Cortes via ffmpeg com fade in/out de 150ms e `loudnorm`; nomes determinísticos. O `manifest.json` permite à experiência detectar conteúdo novo (arquivo vivo, Ato ∞ do doc 01).

## 11. Qualidade e observabilidade

Logs estruturados por estágio; `acervo report` gera HTML com: cobertura por status, distribuição de elementos, duração média por beat, lista de `needs_attention`, custos LLM acumulados. Testes: parsers de saída LLM, validador de quotes, contrato do export (golden files).

## 12. Marcos

| Marco | Entrega | Critérios de aceite |
|---|---|---|
| **M0** | Scaffolding + `scan` + `fetch` | `acervo scan` lista todos os vídeos do canal no DB; `fetch` baixa 3 áudios com meta.json válido; rodar 2× não rebaixa nada |
| **M1** | `transcribe` | 3 transcripts PT com timestamps corretos (verificação manual por amostragem); resumível após interrupção |
| **M2** | Schema + `extract` + taxonomy v1 | 3 `person.json` válidos; 100% das quotes validam como substring; `--dry-run` imprime custo estimado |
| **M3** | `analyze` + `export` | `export/` completo e válido para as 3 pessoas; cortes de áudio tocáveis e alinhados; layout determinístico entre execuções |
| **M4** | UI `review` | Editar um elemento, aprovar uma pessoa, reprocessar preservando lock — os três fluxos funcionando |
| **M5** | Corpus piloto | `acervo run --all` em 10–20 vídeos; `report.html` gerado; custo total registrado |

*(M3 antes de M4 de propósito: ter export cedo desbloqueia o desenvolvimento paralelo da experiência com dados reais mesmo não-revisados.)*

## 13. Riscos e mitigações

- **Qualidade de áudio variável** → Whisper large-v3 + normalização; flag por vídeo `low_quality` para revisão prioritária.
- **Direitos** → corpus piloto pequeno para desenvolvimento; corpus completo só com permissão do canal (doc 00 §4). A ferramenta deve rodar igualmente bem para qualquer canal (nada hardcoded).
- **Alucinação na extração** → validação literal de quotes (req. 7) + confidence + revisão humana.
- **Custo LLM** → cache por hash, `--dry-run`, processamento em lote configurável.
- **Relatos não-lineares** → beats repetíveis e revisão humana como rede de segurança.

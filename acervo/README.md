# acervo — pipeline de dados do LIMIAR

Transforma os depoimentos do canal *"Afinal, o que somos nós?"* em um dataset
padronizado, revisável e pronto para a experiência 3D. Briefing completo:
`../Docs/02-briefing-pipeline-dados.md` (com a decisão de infra no §3).

## Setup

```bash
brew install uv ffmpeg   # se ainda não tiver
cd acervo
uv sync
cp .env.example .env     # e preencha FAL_KEY (necessário a partir do transcribe)
```

## Comandos (estado atual)

```bash
uv run acervo scan --resolve-from <video_id>  # 1ª vez: resolve e escaneia o canal
uv run acervo scan                            # re-escaneia (só registra novos)
uv run acervo fetch                           # baixa os 3 próximos pendentes
uv run acervo fetch --limit 10                # ou um lote maior
uv run acervo fetch <id> [<id>…]              # ou IDs específicos
uv run acervo transcribe                      # transcreve 1 pendente (fal wizper)
uv run acervo transcribe --all                # ou todos os fetched
uv run acervo group                           # agrupa vídeos em pessoas (por título)
uv run acervo extract --dry-run --all         # estima custo LLM antes de gastar
uv run acervo extract <slug> | --all          # extrai beats/elementos/quotes
uv run acervo status                          # fila por status + erros
uv run acervo meta <id>                       # inspeciona o meta.json de um vídeo
```

Estado da fila em `acervo.db` (SQLite); dados canônicos em `data/<video_id>/`
(gitignored — áudio é pesado e regenerável).

## Marcos (doc 02 §12)

- [x] **A0** — scaffolding + `scan` + `fetch` (tag `a0`)
- [x] **A1** — `transcribe` (fal-ai/wizper, pt; tag `a1`)
- [x] **A2** — schema pessoa + `group` + `extract` (openrouter/router, claude-sonnet-4.5, 2 passadas; tag `a2`)
- [ ] **A3** — `analyze` (embeddings, UMAP, HDBSCAN, grafo) + `export/`
- [ ] **A4** — UI `review`
- [ ] **A5** — corpus piloto (10–20 vídeos) + `report.html`

## Descobertas do corpus real (A0)

- O canal tem **597 vídeos** (o patch cables referenciava só 136).
- Depoimentos longos são divididos em **partes** ("1/3", "2/3", "3/3" no
  título) → uma *pessoa* pode ser vários vídeos; agrupamento a decidir no A2.
- O canal hoje se apresenta como "AFTER ALL, WHAT ARE WE?" (títulos dos
  vídeos seguem em PT).

## Fundamentação da taxonomia (fontes a cruzar no A2)

A taxonomia v1 nasce do cruzamento destes instrumentos com o **vocabulário
real do corpus** (transcripts do lote piloto):

- **Escala de Greyson** (1983) — o instrumento padrão de EQM: 16 itens em 4
  domínios (cognitivo, afetivo, paranormal, transcendental). Base principal.
- **NDE-C** (Near-Death Experience Content, Martial et al. 2020) — revisão
  moderna da Greyson; refina transcendência, unidade, inefabilidade.
- **WCEI** (Weighted Core Experience Index, Kenneth Ring 1980) — índice
  histórico de "profundidade" da experiência.
- **MEQ-30** (Mystical Experience Questionnaire) — dimensões místicas:
  unidade, transcendência de tempo/espaço, inefabilidade, qualidade noética.
- **CAPS** (Cardiff Anomalous Perceptions Scale) — percepções anômalas em
  linguagem clinicamente neutra; referência de **tom sem viés** (princípio 2
  do doc 00: as leituras transcendente e neurocientífica coexistem).
- Categorias NDERF (nderf.org) — taxonomia prática usada no maior acervo
  público de relatos.

## Descobertas do A1

- **`fal-ai/wizper` só aceita `chunk_level=segment`** (word é rejeitado pela
  API, apesar da doc genérica do Whisper) — segmentos de ~30s. Suficiente
  para beats e razoável para quotes; se o A2 mostrar que precisamos de
  timestamps por palavra, trocar `transcribe.model` para `fal-ai/whisper`
  (mais lento) no config.
- Qualidade PT excelente (pontuação, termos como "EQM" corretos); ~10–140s
  de processamento por vídeo de 25–64 min.

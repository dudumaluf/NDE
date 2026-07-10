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
uv run acervo status                          # fila por status + erros
uv run acervo meta <id>                       # inspeciona o meta.json de um vídeo
```

Estado da fila em `acervo.db` (SQLite); dados canônicos em `data/<video_id>/`
(gitignored — áudio é pesado e regenerável).

## Marcos (doc 02 §12)

- [x] **A0** — scaffolding + `scan` + `fetch` (tag `a0`)
- [ ] **A1** — `transcribe` (fal-ai/wizper, pt, word timestamps)
- [ ] **A2** — schema `person.json` + `extract` (any-llm) + taxonomy v1
- [ ] **A3** — `analyze` (embeddings, UMAP, HDBSCAN, grafo) + `export/`
- [ ] **A4** — UI `review`
- [ ] **A5** — corpus piloto (10–20 vídeos) + `report.html`

## Descobertas do corpus real (A0)

- O canal tem **597 vídeos** (o patch cables referenciava só 136).
- Depoimentos longos são divididos em **partes** ("1/3", "2/3", "3/3" no
  título) → uma *pessoa* pode ser vários vídeos; agrupamento a decidir no A2.
- O canal hoje se apresenta como "AFTER ALL, WHAT ARE WE?" (títulos dos
  vídeos seguem em PT).

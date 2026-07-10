# STATUS — diário de bordo do projeto

> Este arquivo é a memória viva do projeto. Qualquer pessoa (ou agente de IA)
> em qualquer máquina deve conseguir retomar o trabalho lendo isto + os docs.
> **Ritual**: atualizar ao final de cada marco/sessão relevante, antes do push.

Última atualização: **2026-07-10, tarde** (sessão de design: docs 04/05 + decisão acervo-first)

---

## Onde estamos

| Marco | O quê | Estado |
|---|---|---|
| Análise | Engenharia reversa completa do patch cables.gl (`Docs/ANALISE_TECNICA.md`) | ✔ |
| M0 | Base R3F + WebGPURenderer (fallback WebGL2), personagem VAT único animado, calibração de espaço | ✔ tag `m0` |
| M0.5 | **Morph seamless**: crossfade A/B entre quaisquer clipes, `VatClipPlayer`, botões de estado, arco da história | ✔ |
| M1 | Multidão instanciada (1 draw call, até 4096), cor/escala/fase por instância | ✔ tag `m1` |
| M2 | **Simulação compute**: wander (curl noise), separação (ninguém atravessa ninguém), contenção, mouse atrai/repele, giro suave, passo acoplado à velocidade | ✔ tag `m2` |
| Design | UX de consumo consolidado (`Docs/04`) + dossiê curadoria (`Docs/05`) | ✔ 2026-07-10 |
| A0 | `acervo` scaffolding + `scan` + `fetch` (597 vídeos na fila, 6 áudios baixados) | ✔ tag `a0` |
| A1 | `acervo transcribe` (fal wizper, pt, segmentos ~30s) — 6 vídeos transcritos (~4h45 de áudio), qualidade PT excelente | ✔ tag `a1` |
| A2 | Schema `person.json` (com agrupamento vídeo→pessoa!) + `extract` via any-llm + taxonomy v1 | ⬅ **próximo** |
| A3–A5 | analyze/export → review UI → piloto 10–20 vídeos | pendente |
| M3 | Data layer no app — passa a consumir o export **real** do piloto (fake como fallback) | depois do piloto |
| M4+ | Follow/beats por agente, descoberta, constelação, polimento | pendente — ver adições do doc 04 §11 |

## Decisões tomadas (e porquês)

- **Stack**: React Three Fiber v9 + three r185 `WebGPURenderer` + TSL; Vite; leva para debug UI; screenshots headless via `playwright-core` + Chrome instalado.
- **Morph de animações é requisito central** (pedido do Dudu): qualquer estado
  morfa em qualquer outro fora de sequência, sem pop — implementado com dois
  slots (A/B) no shader e mix por `blend`.
- **Separação O(N²)** por enquanto (folgado até 4096 agentes). Upgrade para
  spatial hash grid com atômicos só quando quisermos 16k+ — registrado no
  README do app.
- **Fallback WebGL2**: simulação roda igual, exceto separação (transform
  feedback não tem acesso aleatório a buffers de vizinhos) — decisão
  antecipada no doc 03 §10.
- O patch cables é **referência técnica, não contrato de design** — o design
  que vale é o dos docs 00/01 (dito explicitamente pelo Dudu).
- Monorepo único no GitHub (`dudumaluf/NDE`) com histórico e tags preservados.
- **Acervo antes do M3** (2026-07-10): os dados informam o design (doc 00 §6);
  o risco técnico do app já foi mitigado (M0–M2); e o M3 fica melhor plugando
  dados **reais** do piloto em vez do corpus fake.
- **UX de consumo consolidado no `Docs/04`** (2026-07-10): resumos por beats
  como padrão + 3 níveis de profundidade (corte/íntegra/link YouTube);
  timeline de hotspots no follow; revelação-depois-da-intuição; sem números
  na escala íntima; e as três mecânicas novas batizadas — **Sintonia**
  (hover-rádio), **Coro** (áudio sincronizado por contexto), **Lentes**
  (re-clusterização temática interativa). Doc 04 vence o 01 em conflito.
- Visual do que é descrito nos relatos: **princípio O(elementos)** — vinhetas
  ambientais por elemento (~20), nunca conteúdo por história (doc 04 §8).
- `Docs/05-dossie-curadoria.md`: apresentação externa (galerias/patrocínio),
  incluindo o formato instalação física. **Falta preencher contato.**
- Painel leva com tema mais largo (`rootWidth` 380px) — rótulos legíveis.
- **Infra do acervo: fal.ai-first** (2026-07-10). Estágios pagos concentrados
  no fal (créditos existentes): transcrição = `fal-ai/wizper` (pt, word
  timestamps, diarização por flag); extração = `fal-ai/any-llm` com modelo
  frontier. Embeddings/análise/cortes/UI = local no Mac M4 (grátis). Backends
  plugáveis por config (whisper local e API Anthropic como alternativas).
  PC RTX 2080S = reserva, não é peça necessária. Piloto estimado em poucos
  dólares; `--dry-run` obrigatório antes de cada lote LLM.

## Fatos técnicos verificados (nunca re-derivar)

Ver `limiar-experience/AGENTS.md` — lista canônica: 1590 vértices, VAT 6×60
frames, basis `x_negz_y`, bakeOffset empírico, normais cruas, ~18 fps de
playback, limite de 8 vertex buffers do WebGPU, etc.

## Pendências e questões abertas

- FAL_KEY configurada no `acervo/.env` (gitignored; NUNCA no .env.example).
- **Limitação registrada**: wizper só dá `chunk_level=segment` (~30s) — ok
  para beats; se A2 exigir word-level, trocar model para `fal-ai/whisper`.
- Conferir custo real do A1 no dashboard do fal (billing) — ~285 min de áudio.
- **Descoberta do A0 que muda o A2**: o canal tem **597 vídeos** (não 136) e
  depoimentos longos são divididos em partes ("1/3", "2/3"…) — uma pessoa
  pode ser vários vídeos. O schema `person.json` precisa de agrupamento
  vídeo→pessoa (decidir no A2). Curadoria do piloto deve preferir histórias
  completas (todas as partes).
- **Escolher os 10–20 vídeos do piloto** (Dudu — diversidade importa, doc 04 §10).
- **Calibração de sensação no navegador real** (o Dudu ainda não validou o M2
  no próprio PC): velocidade, densidade, nervosismo do wander, raio do mouse —
  sliders todos no painel leva. FPS headless é enganoso (ambiente lento);
  medir no navegador de verdade.
- Preencher contato (e-mail/site) no `Docs/05-dossie-curadoria.md`.
- `faceFlip` default parece correto (pessoas de costas quando se afastam),
  mas conferir em movimento; há toggle no painel.
- Warning `THREE.Clock deprecated` no console — cosmético, ignorar.
- Docs duplicados: `Docs/` (raiz, canônico) e `limiar-experience/docs/`
  (espelho para quando se abre só a subpasta). Em caso de conflito, raiz vence.

## Como retomar numa máquina nova

1. Instalar: [Cursor](https://cursor.com), Git, Node 20+ (LTS), Google Chrome
   (usado pelos screenshots headless).
2. `git clone https://github.com/dudumaluf/NDE.git` e abrir a pasta no Cursor.
3. No terminal: `cd limiar-experience && npm install && npm run dev` →
   http://localhost:5199
4. Num chat novo do agente, colar:
   > Leia `AGENTS.md` (raiz) e siga a ordem de leitura de lá. Estamos no
   > estado descrito em `STATUS.md`. Continue de onde paramos.
5. O agente se reconstitui sozinho a partir dos docs — o conhecimento não
   vive em nenhum chat, vive no repositório.

## Ritual de sincronização entre PCs

- **Início de sessão**: `git pull` (pega o que o outro PC fez).
- **Fim de sessão**: atualizar este STATUS se algo relevante mudou →
  `git add -A && git commit && git push`. Nunca terminar com trabalho só local.
- Marcos continuam ganhando tag (`m3`, `m4`, …) + push com `--tags`.

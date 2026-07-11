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
| A1 | `acervo transcribe` (fal wizper, pt, segmentos ~30s) — **39 vídeos transcritos (~30h de áudio)**, qualidade PT excelente | ✔ tag `a1` |
| A1.5 | **Leitura qualitativa do piloto completo**: 17 pessoas fichadas (`acervo/notes/fichas-piloto.md`) + **proposta de taxonomia v1** (`acervo/taxonomy.yaml`) | ✔ aguardando validação do Dudu |
| A2 | Schema pessoa + `group` (17 pessoas) + `extract` 2 passadas (openrouter/router + claude-sonnet-4.5): **17/17 extraídas, 1779 quotes literais validadas, 725 beats, 341 motivos emergentes** (custo real ~US$7,2) | ✔ tag `a2` |
| Premium | Re-transcrição (whisper word-level + diarização, 39 vídeos) + re-extração v2 com prompts corrigidos pela auditoria (96,2% de atribuição de voz correta na v1; v2 com falantes rotulados) | ✔ |
| A4 (adiantado) | **UI de revisão no ar**: `acervo review` → http://localhost:8777 — dashboard da fila/custos, cards das 17 pessoas, página por pessoa (players por parte, timeline de beats colorida, quotes que tocam no clique, aprovar/anonimizar/editar com locked_fields) | ✔ v1 |
| A3 | `analyze` + `export/`: embedding híbrido (40% texto bge-m3 + 60% assinatura IDF de elementos), **7 núcleos nomeados via LLM**, 86 fios, 6 temas emergentes transversais, co-ocorrências; export completo com **1592 cortes de áudio** (manifest `f948b7cbd21e3608`, 1,0 GB) → **M3 do app destravado com dados reais** | ✔ tag `a3` |
| A5 | Fechamento do piloto: curadoria do Dudu na UI + report | ⬅ próximo (junto com M3) |
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

## Hipóteses de pesquisa do corpus (Dudu, 2026-07-10 — validar no A3/stats)

Intuições registradas para virarem queries de co-ocorrência no `analyze`
(números preliminares das fichas do piloto, 17 pessoas):

1. **O amor não é só sentimento presente — é o ensinamento.** Paz ~15/17;
   amor incondicional explícito ~8/17; e em ~7 casos o amor É o conteúdo da
   missão trazida de volta ("ser amor", "o amor salvará a humanidade",
   "seja luz, seja amor", perdão como lição).
2. **Algo se destrava ao beirar a morte.** Sensitividade/mediunidade
   ampliada pós-EQM em ~12/17 (premonição, sentir energias, telepatia,
   "porta entreaberta", "véu mais fino") — quase universal, e as escalas
   clássicas tratam como nota de rodapé.
3. **A missão de contar (às vezes com aviso planetário).** Ordem/cobrança
   explícita de divulgar em ~7/17 — e em ≥4 casos o PRÓPRIO CANAL é o
   veículo designado ("fala com o Carlos", guia cobrando "é hoje?"). Avisos
   de catástrofe/transição planetária em ~7/17 (água, tsunami, sol laranja,
   "transição"). Meta-padrão: o corpus se auto-alimenta.
4. **A rede além das EQMs.** O corpus já contém as pontes: projeção astral
   (6+), meditação/retiros como "o mesmo lugar" (Letícia, Hudson),
   enteógenos, ETs/espíritos (6+), Conscienciologia (Kacianni — tradição
   diretamente ligada a Robert Monroe). Regra de ouro decidida: **dentro do
   Campo, só as vozes do corpus**; literatura externa (Monroe, Bardo
   Thödol, DMT etc.) pode existir como camada curada de "leituras" fora da
   experiência (About/ensaio), nunca misturada aos dados.

→ `taxonomy.yaml` já captura: `sensitividade`, `missao`, `amor_incondicional`
canônicos; `visao_de_catastrofe` e demais pontes como adjacentes. O A3 deve
gerar co-ocorrências específicas para testar cada hipótese no corpus real.

**Veredito preliminar pós-extract (17 pessoas, dados formais):**
H1 CONFIRMADA E AMPLIADA — `missao` é o ÚNICO elemento universal (17/17;
amor 14/17, transformação 16/17). H2 CONFIRMADA — sensitividade 14/17 +
premonição cotidiana 10/17. H3 PARCIAL — missão de contar universal, mas
catástrofe em só 4/17. H4 CONFIRMADA — projeção astral 11/17, vidas
passadas 8/17, ET 7/17: a "rede" é majoritária. BÔNUS anti-clichê: o pódio
do corpus é missão(17)/fora_do_corpo(16)/presenças(16)/paz(16); o
imaginário popular fica atrás — passagem/túnel 7/17, luz 7/17, parentes
falecidos 6/17. Tom: 16/17 "mista" — nenhuma história é simplesmente feliz.

**Veredito preliminar pós-extract (17 pessoas):** todas confirmadas —
`missao` é o ÚNICO elemento universal (17/17, acima até de fora_do_corpo!);
`amor_incondicional` 14/17; `sensitividade` 14/17; rede adjacente forte
(projeção astral 11, vidas passadas 8, ET 7). E os clichês são minoritários:
passagem/túnel 7/17, luz 7/17, parentes falecidos 6/17. As promoções do
corpus validadas: `corpo_como_veiculo` 16/17, `familiaridade` 16/17,
`reentrada_dolorosa` 14/17, `instancias_simultaneas` 9/17.

## Pendências e questões abertas

- FAL_KEY configurada no `acervo/.env` (gitignored; NUNCA no .env.example).
- **Limitação registrada**: wizper só dá `chunk_level=segment` (~30s) — ok
  para beats; se A2 exigir word-level, trocar model para `fal-ai/whisper`.
- Conferir custo real no dashboard do fal (billing) — ~30h de áudio no total.
- Taxonomia v1 validada pragmaticamente (Dudu, 2026-07-10: "vamos seguir,
  itero quando a experiência tiver corpo") — revisão ao vivo no M5.
- **Motivos emergentes precisam de clustering** (343 labels livres, quase
  todos únicos — "telefone_dimensional" vs "ligacao_espiritual" etc.):
  agregar por embedding no A3 antes de promover qualquer um.
- Tom "mista" em 16/17 — o merge derruba para mista quando as partes
  divergem; refinar na review UI (A4).
- `data/` é gitignored: person.json/extraction.json vivem só nesta máquina
  até o A3 gerar o `export/` (que aí decidimos versionar ou não).
- **Achados do piloto que mudam o A2** (detalhes em `acervo/notes/fichas-piloto.md`):
  túnel clássico é raro (não assumir clichês — confirmado); toda história é
  biografia com N experiências (schema precisa de experiências múltiplas +
  tags adjacentes); pessoas recorrentes entre entrevistas (Gilson, 3ª);
  epistemologia do relato varia (direto/meditação/lido); diarização vale o
  custo no corpus completo (entrevistador nomeia fenômenos antes da pessoa);
  nomes vêm do título, não do áudio (ASR erra); eixo de agência no retorno
  (forçado/negociado/escolhido/rendição) é dado central.
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
- **Dataset premium pronto para a curadoria do Dudu na UI** (`acervo review`):
  aprovar pessoas, ouvir quotes, remover erros. Gap conhecido: o merge de
  re-extração ainda não respeita `locked_fields` — corrigir antes da próxima
  re-extração em massa.
- Conferir custo real acumulado no dashboard do fal (transcrição premium +
  extração v2 + retries ≈ estimados US$ 25–30 no total do piloto).
- Os **núcleos do piloto refletem circunstância** (coma, parto, infância...)
  mais que conteúdo da EQM — esperado com N=17; no corpus completo (597) a
  clusterização deve capturar padrões fenomenológicos. Re-avaliar pesos do
  embedding híbrido (40/60) quando escalar.
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

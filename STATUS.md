# STATUS — diário de bordo do projeto

> Este arquivo é a memória viva do projeto. Qualquer pessoa (ou agente de IA)
> em qualquer máquina deve conseguir retomar o trabalho lendo isto + os docs.
> **Ritual**: atualizar ao final de cada marco/sessão relevante, antes do push.

Última atualização: **2026-07-12, tarde** (M3: data layer do app + passada demográfica nas 46 pessoas; Docs: consolidação das ideias de 2026-07-12 + regra permanente de documentação)

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
| VAT-baker/Studio | Motor `tools/vat-core.mjs` + **VAT Studio** (`npm run studio` → localhost:5198): drag-and-drop de GLB/Mixamo, preview 3D com clipes, loops/one-shots renomeáveis e reordenáveis, presets multidão/personagem, **orçamento com semáforo** (vértices/textura/download) e **redução de malha em 1 clique** (meshoptimizer, antes/depois lado a lado), bake com progresso SSE + selftest + botão "testar na experiência". CLI `tools/vat-bake.mjs` (mesmo motor, `--max-verts`, `--selftest`). App carrega via `?vat=<nome>` (aditivo — default segue o asset legado). Validado E2E com Soldier.glb nos 2 backends (7434→2036 verts, textura 2036×180, 4,2 MB, tudo verde). Guia: `limiar-experience/tools/README.md` | ✔ |
| Lote 2 | **Corpus de 46 pessoas** (97 vídeos, ~75h): re-análise com voz da depoente — **12 núcleos nomeados via LLM** (maior = 9 pessoas, 20%; silhouette 0,177), 250 fios, 8 temas emergentes transversais; **4027 quotes validadas** (373 rejeitadas na extração), média 22,8 elementos/pessoa; export com **4061 cortes de áudio** (manifest `d1a2c16f7298fa59`, 2,7 GB). Ranking top-5: missão 45/46, presenças 43, inefabilidade 43, corpo_como_veículo 43, transformação 42 — clichês continuam atrás (luz 25, passagem 24, parentes 20) | ✔ |
| VAT Studio v2 | Os 4 pedidos do Dudu: **remover clipe** na lista (× — orçamento recalcula na hora, ⧉ duplica); **combinar 2+ clipes em UM track** (multi-seleção → crossfade configurável 0,2 s; motor `tools/merge-clips.mjs` compartilhado Node/browser — preview = bake; loop fecha se começar/terminar no mesmo clipe cíclico); **root motion completo** ("andar no lugar" agora exporta a trajetória removida no vat.json: `rootMotion[{clip, samples/frame}]` — multidão ignora, one-shots dirigidos aplicam como translate via `src/vat/rootMotion.ts` + toggle no leva); **morph entre DUAS texturas no app** (`?vat=a&vatB=b`, mesma malha): descriptor `vat-bake/2` ganhou `meshHash` (identidade da malha pós-decimação), linhas de B empilham abaixo das de A na DataTexture, clipes com índice global, re-normalização B→A no load, `vatPlayer.play(i, {vat})` + dropdown "textura" no leva — shader intacto (zero binding extra). Studio avisa "morfável com X / não-morfável" ao gerar. Validado: soldier-a (Idle+Walk) ⇄ soldier-b (Run) nos 2 backends (screenshots), recusa de malha ≠ testada, e2e estendido (deletar+combinar+morfabilidade) OK | ✔ |
| Demográficos | **Passada complementar barata** (`acervo demographics`, 1 chamada/pessoa, claude-haiku-4.5, custo real **US$ 0,55**): sexo (31F/14M/1null — o null é o vídeo-lixo `nayda-cabral`), religião antes/depois 28/46 (padrão dominante "católica na época → espírita/espiritualidade hoje"), local do evento 42/46 (16 estados + Noruega, Portugal, EUA), ano 37/46 (de 1969 a 2025; 16 nos 2020s), tempo clínico 18/46 (comas de 4–44 dias, paradas de 15–20 min), tempo subjetivo 17/46 ("lá não existia tempo", "anos dentro do coma"), profissão 42/46. Schema `Demographics` (migração suave), prompt `demo-v1`, cache por `demographics_version`, export atualizado (JSONs com `demographics`, hash `c8c437af007d3008`, cortes intactos), bloco somente-leitura na UI de revisão | ✔ |
| A5 | Fechamento do piloto: curadoria do Dudu na UI + report | ⬅ próximo |
| M3 | **Data layer no app**: multidão dirigida pelo export real (46 pessoas → primeiros slots, resto dormente escuro); cores por núcleo (12, matiz espaçado por ângulo áureo via `iColorScale` — zero vertex buffer novo); **gravidade** (seek do umap3d escalado, arrival+damping, toggle no leva + `?gravity=1`, slider escala do mapa ~14); **fios** (LineSegments TSL, endpoints lendo posições vivas: storage read-only no vertex em WebGPU, PBO em WebGL2; alpha × weight); **Lentes v0** (dropdown com os 36 elementos da taxonomy: quem tem gravita ao anel central, quem não tem recua à borda); HUD "46 pessoas · 12 núcleos · manifest d1a2c16f"; `sync-content` em predev/prebuild; fallback silencioso sem content/ (roda procedural como no M2) | ✔ tag `m3` |
| Lentes demográficas | **6 lentes não-fenomenológicas** no app (`src/data/demoLens.ts`, dropdown próprio no leva + `?dlens=sexo\|decada\|causa\|geo\|religiao\|tempo`, exclusão mútua com a lente de elemento): sexo, **década do evento em linha do tempo física** (eixo X 1969→2025, fileiras por ano), causa, geografia (parse UF/país do texto livre), trajetória religiosa (buckets heurísticos) e **tempo** (arco subjetivo com cor do bucket clínico — "20 min que viram uma vida"); null = faixa "não declarado" na borda, nunca inventado; cores temporárias por categoria pela MESMA via `iColorScale` + legenda com contagens no HUD; `sync-content` destila `demographics.json`; verificação offline `scripts/demo-lens-check.mjs` + screenshots nos 2 backends | ✔ |
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
- **M3: content/ é CÓPIA, não symlink** (2026-07-12): `npm run sync-content`
  (roda em predev/prebuild) copia só os JSONs do `acervo/export/` para
  `public/content/` (gitignored). Symlink arrastaria os ~2,7 GB de áudio para
  cada `vite build` e quebraria em máquina sem o export. Áudio fica para o M4
  (streaming direto vs cópia parcial).
- **M3: pessoas reais = primeiros 46 slots** de agente (slot i =
  `manifest.people[i]`); dormentes = resto da multidão, cinza quente escuro.
  Cor entra pelo `iColorScale` existente (vec4 cor+escala) — nenhum atributo
  novo (limite de 8 vertex buffers). Alvos (gravidade/lente) em storage buffer
  vec4 (xyz alvo, w tem-alvo) escrito da CPU (46 escritas por mudança).
- **M3: lente ativa força o seek** mesmo com gravidade desligada (aplicar
  lente sem gravidade não teria efeito visível); ângulo do anel preservado do
  UMAP para vizinhanças não embaralharem ao trocar de lente.
- **Lentes demográficas (2026-07-12)**: bucketing heurístico DOCUMENTADO no
  `demoLens.ts` — religião checa matriz africana antes de "espírit*" (senão
  "…umbanda…, hoje espiritualidade" mudaria de bucket) e inclui "kardec";
  geografia vence o match de MENOR índice no texto (o local do evento vem
  primeiro); tempo clínico com fallback nominal (coma/UTI≈dias, desmaio≈min,
  intervalo de datas≈mês) e subjetivo em rank 0–1 ("piscar"→0, "sem tempo"→1).
  Trocar lente NÃO reseta a sim (as pessoas caminham ao novo arranjo); cores
  por categoria pela MESMA via iColorScale (nenhum vertex buffer novo); null
  sempre vira faixa "não declarado" na borda/atrás — nunca inventar dado.
- **Docs: consolidação das ideias de 2026-07-12 + regra permanente de
  documentação** — doc 04 ganhou o princípio "um sistema se organizando,
  não ruído" (§1.1), a cadeia de interação do M4 (§4.1) e as mecânicas
  novas: Maré (§5.4), estados de animação como linguagem da sim (§5.5),
  fios inteligentes (§5.6), palavras no espaço (§5.7), lentes demográficas
  (§5.8), legenda viva (§6.1); doc 03 ganhou o §14 (VAT Studio + post com
  orçamento dinâmico + fatos WebGL2 do M3); AGENTS.md raiz ganhou a regra:
  **nenhuma ideia de sessão fica sem registro nos docs antes do fim da
  sessão**.

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

**Veredito no corpus de 46 (lote 2, 2026-07-12) — os padrões do piloto
seguram:** H1 mantida — `missao` 45/46 (98%; a única exceção é um vídeo que
não é relato de EQM, ver pendência Nayda); amor 34/46, transformação 42/46.
H2 mantida — sensitividade 37/46 (80%) + premonição cotidiana 19/46.
H3 igual (parcial) — catástrofe caiu para 4/46 (9%): era peculiaridade do
piloto, não padrão. H4 mantida — projeção astral 24/46 (52%), vidas
passadas 20/46, ET 14/46. Anti-clichê CONFIRMADO com N maior: pódio =
missão(45)/presenças(43)/inefabilidade(43)/corpo_como_veículo(43)/
transformação(42); clichês na metade de baixo — luz 25/46 (54%), passagem
24/46 (52%), parentes falecidos 20/46 (43%), túnel nem aparece como key
própria. Tom: 36/46 mista, 10/46 positiva. Clustering: os 12 núcleos agora
têm assinatura fenomenológica (estado_de_graca 4,6×, visao_cosmica 5,8×,
parentes+memória_pré-encarnação, angustiante+presença_perturbadora…) com
causas de morte misturadas dentro de cada um — melhor que o piloto, onde
circunstância dominava; os nomes do LLM ainda puxam para circunstância em
2-3 casos ("Na mesa de cirurgia").

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
  embedding híbrido (40/60) quando escalar. → **Lote 2 (N=46): melhorou.**
  HDBSCAN degenerou (48% ruído) e foi descartado por guarda-rail novo
  (≤25% ruído); aglomerativo com k até 13 escolhido por silhouette (k=12,
  0,177 vs 0,209 do HDBSCAN mas com todo mundo dentro). Pesos 40/60
  mantidos (varredura em `notes/exp_cluster46.py`: 30/70 e 50/50 não
  ganham de forma consistente).
- **Curadoria (A5) — lixo conhecido no corpus de 46**: `nayda-cabral`
  ("O que é orar") **não é relato de EQM** (0 elementos, monólogo sobre
  oração) — remover ou marcar; Nayda Cabral tem **3 entradas** de pessoa
  (3 vídeos avulsos não agrupados); 4 slugs vêm de título, não de nome
  (`a-impressionante-kerly-costa-...`, `era-quantica-...`,
  `o-meu-corpo-e-uma-coisa-...`, `vou-te-mostrar-...` — este sem nome).
- **Mac Air 16 GB: embeddings do analyze rodam na CPU** — MPS deu deadlock
  (waitUntilCompleted eterno) e depois thrashing de memória com docs de
  ~8k tokens; `ACERVO_EMBED_DEVICE=cpu` + batch_size=4 resolvem (~20 min
  para 46 pessoas). Registrado em `analyze.py`.
- `faceFlip` default parece correto (pessoas de costas quando se afastam),
  mas conferir em movimento; há toggle no painel.
- Warning `THREE.Clock deprecated` no console — cosmético, ignorar.
- Docs duplicados: `Docs/` (raiz, canônico) e `limiar-experience/docs/`
  (espelho para quando se abre só a subpasta). Em caso de conflito, raiz vence.
- **iCloud desta máquina trava processos**: `~/Documents` sincroniza no
  iCloud; arquivos evictados ("dataless") fazem git/tsc dormirem para sempre
  em `read`. Cura: `brctl download <caminho>` ou reinstalar `node_modules`.
  Registrado também no `limiar-experience/AGENTS.md`.
- **Variante do problema acima no venv Python**: o iCloud às vezes marca
  arquivos com a flag `UF_HIDDEN` — o CPython **ignora silenciosamente**
  `.pth` escondidos (site-packages), o que quebra o install editable do
  acervo com `ModuleNotFoundError: acervo.cli`. Cura:
  `chflags -R nohidden acervo/.venv` (+ `brctl download acervo/.venv`).
- **Demographics: revisar na curadoria (A5)** — `ano_evento` pode vir de
  "em 2025 ele…" dito pelo Carlos na abertura (ok) ou de conta com "há X
  anos" (conferir); `nayda-cabral` (vídeo que não é EQM) veio toda null,
  como esperado. (2026-07-12: aconteceu
  de novo no início do M3 — `find . -flags +dataless` localiza os presos;
  matar `bird`/`fileproviderd` + `brctl download` re-materializou.)
- **Trabalho órfão no `acervo/` (não commitado, herdado de sessão que caiu)**:
  passada demográfica barata (`demographics.py` + prompt + `Demographics` no
  schema + CLI + coluna na webui) — 1 chamada por pessoa (haiku, abertura da
  parte 1 + fechamento da última). Parece completo mas NUNCA RODOU num lote;
  ficou fora do commit do M3 de propósito. Testar com `--dry-run`, rodar nas
  46 e commitar como marco próprio (ou descartar se a curadoria A5 não pedir).
- **Lentes demográficas — ideias para a v2**: escala do corpo pelo tempo
  subjetivo (quem viveu "uma vida" fica maior que o relógio diz); rótulos 3D
  nos setores/anos em vez de legenda só no HUD; na lente tempo, um fio
  ligando a posição clínica à subjetiva da mesma pessoa (a distorção vira
  linha visível); parse de `local_origem` para uma lente "migração"
  (origem→evento); profissão precisa de bucketing LLM (texto livre demais
  para heurística). Limitações registradas: "crente em Deus sem religião"
  cai no bucket evangélica pela palavra "crente"; tempo clínico usa valores
  nominais quando o texto não traz número (coma/UTI≈5d); `parada cardíaca`
  do cause_category some dentro de "clínico: minutos" na lente tempo.
- **M3 — pendências para o M4**: (a) fios são debug visual por enquanto —
  na experiência final devem revelar-se progressivamente (doc 01/05);
  (b) layout por lente é anel simples (tem/não-tem) — considerar espiral por
  confiança do elemento ou peso do quote; (c) dormentes ainda caminham com
  wander normal — avaliar velocidade menor/idle para leitura mais clara dos
  núcleos; (d) posições UMAP dos 12 núcleos se sobrepõem parcialmente
  (silhouette 0,177) — o `mapScale` ajuda mas núcleos vizinhos se tocam:
  avaliar "explode por cluster" (offset radial por centroide) como opção de
  leitura; (e) FPS headless subestima — validar sensação no navegador real.

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

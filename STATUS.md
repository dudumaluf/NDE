# STATUS — diário de bordo do projeto

> Este arquivo é a memória viva do projeto. Qualquer pessoa (ou agente de IA)
> em qualquer máquina deve conseguir retomar o trabalho lendo isto + os docs.
> **Ritual**: atualizar ao final de cada marco/sessão relevante, antes do push.

Última atualização: **2026-07-16** (app: VAT default `Movements_Simpler`)

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
| Lote 3 | **Corpus de 66 pessoas** (125 vídeos, ~96h) — seleção por diversidade: 20 pessoas novas (~16 homens, 14M→31M vs 34F; 3 EQMs angustiantes explícitas — Enio Gondran "eu não desejo isso para ninguém", "Eu estava na lama", "Não temo a morte, mas temo voltar lá"; céticos/ateus 4; infantis 2; causas únicas: caça submarina/apneia) + 2 completadas (Silvana Pires 1/2, Betânia 3/3). 28 vídeos, ~21h de áudio, 0 falhas (2 timeouts de rede retentados com sucesso). Re-análise: **13 núcleos via HDBSCAN** (antes o guarda-rail derrubava; maior = "Os que estiveram em coma" 25 pessoas 38%, silhouette n/d), 373 fios, 14 temas emergentes; núcleo novo **"As experiências difíceis"** (3 pessoas, as 3 do lote) + "Os céticos que atravessaram" (12) e "As paradas cardíacas súbitas" (3). **Ranking N/66: inefabilidade 62 destronou missão 61**; presenças/transformação 59, fora_do_corpo/paz/corpo_como_veículo 57, telepatia 55; clichês: luz 37 (56%), passagem 32, parentes 26, túnel 0. Média 21,6 elementos/pessoa; tom: 47 mista / 16 positiva / **3 angustiantes (as primeiras do corpus)**. Export manifest `ccb663eccf5a9f36`, 2488 beats, **5389 cortes de áudio (3,6 GB)** — cortes antigos intactos. **Custo real ≈ US$ 13,6 ≤ teto de US$ 16** (transcrição ≤9,0 medida por compute-seconds; extração ~3,9 est. dry-run 3,61+partes novas; demographics 0,23 real; arc 0,32 real). Curadoria: 8 slugs de título sem nome de pessoa (renomear na UI); `medico-neurologista…` e `sou-cetico…` podem ser a mesma pessoa de vídeos distintos — conferir | ✔ 2026-07-13 |
| VAT Studio v2.4 | **Fix da regressão do fluxo clássico** (GLB base + anim GLB sem skin do mesmo rig cruzava braços após edd8ecd): política nova no retarget — bypass TOTAL (aplicação direta, delta 0.0 medido em 147 tracks) quando as translações locais dos ossos homônimos batem (critério imune a pose; anim-only exportada com nós posados não engana mais), rebase só com diferença real de convenção (FBX m/Y-up × GLB cm/Z-up), rotação corrigida só nos ossos-raiz (containers, imunes a pose) — "rest" duvidoso nunca vira correção. FBX×GLB do mesmo personagem ficou MAIS exato (desvio de junta 0,69→0,04) e segue no chão; e2e parte 5 permanente ("regressão do fluxo clássico", exige delta 0.0 exato + pés no chão no par FBX×GLB) | ✔ |
| VAT Studio v2.5 | **Fix queda no preview/bake** (Death/Dying: T-Pose + Without Skin): `tools/fold-container-tracks.mjs` com duas estratégias — (1) **fold** no osso-raiz quando a pose de mundo varia (Mixamo `Armature`→Hips; probe com `skeleton.update`); (2) **keep-container** quando a queda está no nó pai e o osso raiz fica constante no bind local (rigs Blender `low_poly_base_mesh`→`spine` — Death From Front Headshot do Dudu: minY skinado −0,006…−0,024, igual ao FBX com skin). Falso positivo `sem movimento: coluna` suprimido nesse modo. e2e verde | ✔ sessão 2026-07-15 |
| VAT pivot (app) | **Sliders pivot X/Z** no leva (`Field · physics` / `Character`): deslocam o eixo de rotação em unidades do bake (× person scale no mundo). Persistem em `Field · physics.pivotX/Z` (+ `?pivotX=` / `?pivotZ=`). Fix prefs 2026-07-16: lia `VAT.*` mas save gravava path do leva — migração `VAT.*`→`Field · physics.*` | ✔ sessão 2026-07-15 |
| Steer pivot + debug | **Leme** com pivot pessoa/screen, debug visual, easings expostos. **Story field** (2026-07-16): `story repel radius` (ex-bubble), strengths separados (`storyFAt`/`storyFRep`, max 4), attract radius max 15 m, debug `StoryFieldDebug.tsx`. Docs 04/07 | ✔ sessão 2026-07-16 |
| VAT Studio v2.3 | **Diagnósticos de artefato de animação na UI** (feedback do criador: "limp leg" + braços cruzados): (1) pose de descanso comparada por DIREÇÕES de osso entre fonte e base — T vs A-pose vira aviso no painel de arquivos com a recomendação canônica (retarget no próprio Mixamo, documentado no README); (2) juntas congeladas por clipe (osso core sem track/constante em clipe que se move, relativo ao p75) — "sem movimento: perna esq. (LeftUpLeg…)" na lista de clipes, aviso no bake, `clips[].frozenRegions` no vat.json e selftest acusando; (3) decimação com solda respeitando o osso dominante (vértices de membros opostos nunca se fundem) + aviso de redução desproporcional por região no orçamento. Validado: fixtures positivas (Walk sem perna esq., Run sem braço dir.) e negativas limpas; e2e parte 4 nova; screenshots dos 3 avisos | ✔ |
| VAT Studio v2.2 | **Fix do bug do criador ("chão na cintura" com base GLB + anim FBX)**: tracks de posição/rotação agora são rebaseadas para a convenção do rig da base no retarget (`tools/retarget-units.mjs`, compartilhado preview/bake — rigs GLB do Blender têm ossos em cm/Z-up sob nó 0,01 e juntas reorientadas; valores crus afundavam/tombavam o corpo). Tracks de containers ("Armature") de arquivos estrangeiros ignoradas; chão automático POR CLIPE no bake (`clips[].groundOffset`) + campo Y manual por clipe na UI/CLI (`clips[].yOffset`); selftest novo: pés no y=0 em todos os clipes; altura da análise medida via skinning. Validado com xbot.glb + samba-anim.fbx (fixture nova, e2e parte 3): min-Y do preview −0,9 → −0,01, juntas idênticas à fonte, app OK nos 2 backends | ✔ |
| VAT Studio v2.1 | **FBX do Mixamo direto, sem Blender**: drag-and-drop de .fbx no Studio e na CLI (FBXLoader em Node com shims mínimos; materiais/texturas ignorados como no GLB). Normalizações automáticas em `tools/fbx-normalize.mjs` (compartilhado preview/bake): cm→m (UnitScaleFactor, com heurística p/ arquivos sem o campo), takes vazios descartados, "mixamo.com"→nome do arquivo, "Without Skin" retargeta por nome de osso (badge "N/M tracks casam" / "esqueleto incompatível" na UI). FBX ASCII/6.x recusado com mensagem clara; selftest vigia unidades mistas entre clipes. Validado com FBX Mixamo autêntico (Samba Dancing via repo three.js, fixtures em tools/fixtures/): análise→bake→selftest→app nos 2 backends, delta FBX↔GLB de 1e-7, e2e estendido (parte 2 FBX) passando | ✔ |
| VAT Studio v2 | Os 4 pedidos do Dudu: **remover clipe** na lista (× — orçamento recalcula na hora, ⧉ duplica); **combinar 2+ clipes em UM track** (multi-seleção → crossfade configurável 0,2 s; motor `tools/merge-clips.mjs` compartilhado Node/browser — preview = bake; loop fecha se começar/terminar no mesmo clipe cíclico); **root motion completo** ("andar no lugar" agora exporta a trajetória removida no vat.json: `rootMotion[{clip, samples/frame}]` — multidão ignora, one-shots dirigidos aplicam como translate via `src/vat/rootMotion.ts` + toggle no leva); **morph entre DUAS texturas no app** (`?vat=a&vatB=b`, mesma malha): descriptor `vat-bake/2` ganhou `meshHash` (identidade da malha pós-decimação), linhas de B empilham abaixo das de A na DataTexture, clipes com índice global, re-normalização B→A no load, `vatPlayer.play(i, {vat})` + dropdown "textura" no leva — shader intacto (zero binding extra). Studio avisa "morfável com X / não-morfável" ao gerar. Validado: soldier-a (Idle+Walk) ⇄ soldier-b (Run) nos 2 backends (screenshots), recusa de malha ≠ testada, e2e estendido (deletar+combinar+morfabilidade) OK | ✔ |
| Demográficos | **Passada complementar barata** (`acervo demographics`, 1 chamada/pessoa, claude-haiku-4.5, custo real **US$ 0,55**): sexo (31F/14M/1null — o null é o vídeo-lixo `nayda-cabral`), religião antes/depois 28/46 (padrão dominante "católica na época → espírita/espiritualidade hoje"), local do evento 42/46 (16 estados + Noruega, Portugal, EUA), ano 37/46 (de 1969 a 2025; 16 nos 2020s), tempo clínico 18/46 (comas de 4–44 dias, paradas de 15–20 min), tempo subjetivo 17/46 ("lá não existia tempo", "anos dentro do coma"), profissão 42/46. Schema `Demographics` (migração suave), prompt `demo-v1`, cache por `demographics_version`, export atualizado (JSONs com `demographics`, hash `c8c437af007d3008`, cortes intactos), bloco somente-leitura na UI de revisão | ✔ |
| Arco emocional + timeline norm | **O tempo interno das histórias** (ideia do Dudu, 2026-07-12; habilita o "modo Maré", doc 04 §5.4). Passada `acervo arc` (1 chamada/pessoa, claude-haiku-4.5, prompt `arc-v1`, cache por `arc_version` = prompt:modelo:hash-dos-beats, custo real **≈ US$ 1,05** incl. retries): valência −2..+2 + label por beat (46/46 pessoas, 1933 beats, alinhamento 1:1 garantido — 0 lacunas), entrada/saída com 1 frase + valência, `virada` = beat do ponto de virada. **Achado agregado ("degradê", n=45 sem o vídeo-lixo): entra-se baixo, sai-se no teto** — entrada média **−0,84** (hist: −2×5 · −1×28 · 0×12; ninguém entra positivo), saída média **+1,98** (44/45 saem em +2; única exceção eder-luiz +1), delta médio **+2,8**; virada mediana em **t=0,15** da história (35/45 num beat de EQM); fases: evento_morte −1,34 · eqm +0,46 · integração +0,66. Exceções que dão textura: NINGUÉM sai mais baixo do que entrou; arcos internamente sombrios (eder-luiz e benjamim-chamorro 56% dos beats nucleares negativos; 8 pessoas com fase EQM de média NEGATIVA — benjamim −0,96 com 23 beats — e ainda assim saem +2) e viradas tardias (betania/daniela t≈0,62). + **Timeline normalizada local** (`timeline_norm`: duração total + offset por parte; recomputável) e `t_norm`/`t_norm_end` [0,1] em cada beat e `t_norm` em cada quote do export. Export re-rodado só nos JSONs (manifest `d27de65adf0ea1d3`, **4061 cortes de áudio intactos — 0 refeitos**), bloco "Arco" (sparkline de valências clicável + entrada/saída) na UI de revisão, doc 04 §5.4 A Maré com os dados reais. Parser JSON agora tolera `+2` com sinal (haiku adora) | ✔ |
| A5 | Fechamento do piloto: curadoria do Dudu na UI + report | ⬅ próximo |
| M3 | **Data layer no app**: multidão dirigida pelo export real (46 pessoas → primeiros slots, resto dormente escuro); cores por núcleo (12, matiz espaçado por ângulo áureo via `iColorScale` — zero vertex buffer novo); **gravidade** (seek do umap3d escalado, arrival+damping, toggle no leva + `?gravity=1`, slider escala do mapa ~14); **fios** (LineSegments TSL, endpoints lendo posições vivas: storage read-only no vertex em WebGPU, PBO em WebGL2; alpha × weight); **Lentes v0** (dropdown com os 36 elementos da taxonomy: quem tem gravita ao anel central, quem não tem recua à borda); HUD "46 pessoas · 12 núcleos · manifest d1a2c16f"; `sync-content` em predev/prebuild; fallback silencioso sem content/ (roda procedural como no M2) | ✔ tag `m3` |
| Lentes demográficas | **6 lentes não-fenomenológicas** no app (`src/data/demoLens.ts`, dropdown próprio no leva + `?dlens=sexo\|decada\|causa\|geo\|religiao\|tempo`, exclusão mútua com a lente de elemento): sexo, **década do evento em linha do tempo física** (eixo X 1969→2025, fileiras por ano), causa, geografia (parse UF/país do texto livre), trajetória religiosa (buckets heurísticos) e **tempo** (arco subjetivo com cor do bucket clínico — "20 min que viram uma vida"); null = faixa "não declarado" na borda, nunca inventado; cores temporárias por categoria pela MESMA via `iColorScale` + legenda com contagens no HUD; `sync-content` destila `demographics.json`; verificação offline `scripts/demo-lens-check.mjs` + screenshots nos 2 backends | ✔ |
| Frases do visitante | **Voz editorial nas lentes** (pedido do Dudu: "uma frase desmistificando"): `frase_visitante` (≤140 chars, fiel às fichas/vocabulário do corpus) nos 36 elementos canônicos + nos 8 adjacentes (que viraram mapping com `label`) + bloco novo `lentes_demograficas` (6 lentes, keys iguais às do app: sexo/decada/causa/geo/religiao/tempo) no `taxonomy.yaml`; export publica tudo no `taxonomy.json` (`elementos[].frase_visitante`, `adjacentes_detalhe`, `lentes_demograficas`; `adjacentes` segue lista de keys — compat com app e extract.py intactos); re-export só JSONs (manifest `8016c49920249a9c`, 4061 cortes de áudio intactos); nota no doc 04 §6.1 (Legenda viva). Exibição no bottom da experiência será plugada no app depois | ✔ aguardando revisão editorial do Dudu |
| Online (protótipo) | **https://limiar-prototipo.vercel.app** — Vercel Hobby (custo zero), projeto `limiar-prototipo`, deploy **prebuilt** (build local com content/ sincronizado + upload do `dist/`). `noindex` + `X-Robots-Tag` (URL discreta, doc 00 §4). **Áudio via Supabase** (`audio-cortes`, Voz v1 — fora do bundle Vercel). Re-deploy: `npm run deploy` no `limiar-experience/` (seção Deploy do README). **Próximo deploy** leva auto-play no follow + UX desta sessão (2026-07-15) | ✔ 2026-07-13 · redeploy pendente |
| Post effects | **Pós-processamento com orçamento dinâmico** (`src/render/post/`): **névoa de altura** fake-volumétrica (`scene.fogNode` TSL, extinção exp² por altura × tri-noise 2 oitavas animado lento — sem ray-march, funciona igual nos 2 backends), **vinheta** TSL no quad final (~grátis), **bloom** (BloomNode, threshold alto 0.72 — só realces de cor respiram, o cinza nunca estoura), **GTAO meia-res 8 amostras** (normais reconstruídas da depth, sem MRT/denoise; depth multisampled é ilegível no WebGPU → com AO o pass perde o MSAA 4× e um FXAA fecha a cadeia — o custo exibido embute a troca). SSR/SSGI descartados de projeto (ray-march caro; cena fosca sem reflexos não paga). Menu **Effects** no leva: cada efeito exibe **custo MEDIDO em ms no label** (delta de média móvel ~2s no toggle; GPU-timestamps via `trackTimestamp`+`resolveTimestampsAsync` no WebGPU — no fallback o timer do ANGLE mente e cai p/ frame-time), presets **mínimo/leve/médio/alto** (`?fx=`, default leve) e **auto por fps** (`?fxauto=1`: prova do alto p/ baixo, 5 s/degrau, fica no 1º que segura ≥50 fps; degrada 1 degrau após 10 s abaixo; log `[fx-auto]`; não re-sobe sozinho — religar o auto re-prova). Custos medidos (este Mac, headless 1280×720, GPU-time, 1024 agentes): névoa ~1,4 ms · vinheta ~0,0 · bloom ~0,8 · AO ~2,9; 60 fps nos 4 presets nos 2 backends. Bench: `scripts/fx-bench.mjs` + `fx-auto-probe.mjs` | ✔ 2026-07-12 |
| Leitura visual | **O Campo legível "vivo mas não confuso"** (doc 04 §5.6/5.7/6.1): fios com fade por distância entre pontas + peso→cor/alpha (gama) + modo "só núcleos formados" (coesão por endpoint via alvos em atributo; **fix crítico: alpha de linha avaliado em varying no vertex — no fragment os índices de agente interpolam e o fio esfarela**); **palavras 3D nos núcleos** (`src/render/ClusterLabels.tsx`: label do cluster em canvas→plane billboard CPU, fade-in lento quando o núcleo se forma — dispersão real via readback GPU amostrado ~0,6 s com fallback por timer; Sprite não desenha no fallback WebGL2 do r185); **Legenda premium** (`src/ui/Legend.tsx`, fora do leva: chips cor+label+contagem do que está em cena — núcleos / lente de elemento / demográfica —, clique dessatura os demais por 2 s, **frase_visitante da lente ativa no bottom** com crossfade; absorveu a faixa central antiga); **coesão visual** (lente ativa dessatura não-pertencentes ~35% via re-escrita do iColorScale, zero custo por frame); screenshots nos 2 backends em `shots/m35-*` | ✔ 2026-07-12 |
| M3.6 | **Estados de animação POR AGENTE** (doc 04 §5.5 sai do papel; doc 03 §14.4): o crossfade A/B do shader agora é por instância — buffer `states` vec4 (clipA/clipB/blend + stateId/stateTime empacotados) escrito por um **state pass próprio** (WebGL2/TF: exatamente 4 varyings — a integração de fase migrou p/ ele; update ficou com 3); parado⇄andando⇄"correndo" pela **velocidade real com histerese** (entrar > ficar, dwell 0,35 s, fade 0,3 s); "correndo" = walk com boost de fase 1,35× (não há clipe run na VAT — `clipRoles.ts` detecta /corr\|run/ por nome e desliga o boost quando o Studio assar um); **chegada assenta em idle OU rezar** (sorteio estável `hash(índice)`, peso 2× de rezar p/ quem tem `transformacao` via `agentMeta`); **onda de chegada** (teto de velocidade × distância ao alvo: longe corre, perto assenta primeiro); **pausas orgânicas de wander** (sawtooth por agente — multidão mista parado/andando sem gravidade e sem script); **dormentes × com-história** (multiplicadores próprios de velocidade/wander no leva, dormentes 0,7×/0,8×); render lê `states` como storage **PBO** no vertex (zero vertex buffer novo — seguem 7 de 8); grupo "Estados (por agente)" no leva com toggle master (off = botões globais/`?estados=0`, debug intacto); debug cor "estado" (cinza/verde/laranja/azul/roxo); sonda `scripts/states-probe.mjs` (histograma via readback; no WebGL2 usar `&labels=0`); **fix de fundação: `hash()` do TSL trunca seed com toUint() — seeds por agente têm de ser inteiros distintos**; 60 fps nos 2 backends c/ 1024 agentes (headless); screenshots `shots/estados-*` | ✔ 2026-07-12 |
| Aparência + preset | **Os 5 pedidos diretos do Dudu (2026-07-12; doc 03 §14.5, doc 04 §6.2)**: (1) **preset persistente** — grupo "Preferências" no leva: salvar como padrão serializa o painel INTEIRO (todos os grupos, por path "Grupo.key") em blob versionado no localStorage (`limiar.tuning`); restaurar fábrica, exportar (clipboard + download `tuning.json` — o do doc 03 §4.6) e importar (colar JSON, aplica na hora e persiste); boot com precedência **query param > salvo > fábrica** (todo default passa por `pref()` — REGRA: controle novo nasce embrulhado, senão salva mas não restaura); merge por chave tolerante a versões; sonda `scripts/prefs-probe.mjs` (salvar→reload→qp→fábrica, tudo verde). (2) **Névoa dominável** — PostFX virou dono único (Scene sem `<fog>`): master toggle (`?fog=0` = céu limpo DE VERDADE; antes a linear clássica ficava sempre acesa) + **recuo por altura da câmera** (slider "névoa: altura de recuo", `?fogRecuo=`, default 16 m): acima dele a névoa de distância desvanece (smoothstep suave), o banco vira camada fina (caminho óptico ≤2,5×altura) e o tri-noise desliga (de topo virava listras) — god view limpo, chão enevoado. (3) **Cores do mundo** — grupo "Aparência": fundo/céu, névoa (segue fundo por default, toggle solta), chão, grid cor+alpha (remonta por key — vertex colors) e **HSB global das PESSOAS** (matiz°/saturação/brilho na paleta de núcleos + dormentes via re-escrita do iColorScale — zero custo por frame). (4) **"Só quem tem história"** (Multidão, `?onlyPeople=1`): mesh.count = 46 — pessoa i = instância i (permutação de spawn só muda posição), sim continua inteira, fios/labels intactos, sem respawn ao alternar. (5) **Destaque forte da legenda**: clique no chip = selecionados em cor PLENA, resto colapsa num cinza ÚNICO (não dessaturação) com hold configurável + fade-out 0,7 s; sliders "destaque: intensidade/duração"; headless `?flash=cluster:5&flashDelay=&flashHold=`. Screenshots `shots/ctrl-*` nos 2 backends | ✔ 2026-07-12 |
| Painel EN + doc 06 | **Painel leva traduzido para inglês** (pedido do Dudu, 2026-07-13: "os parâmetros em inglês me ajudam mais"): grupos e labels EN (Multidão→Crowd, Simulação→Simulation, Estados (por agente)→States (per agent), Dados (M3)→Data (M3), Aparência→Appearance, Preferências→Preferences, Cena→Scene, Personagem→Character, Lente demográfica→Demographic lens); **keys internas, query params e valores de dropdown intactos** (rótulo EN → valor PT via options-objeto do leva); **migração automática de prefs salvas** (`prefs.ts` `GROUP_RENAMES`: blobs antigos com paths PT são re-escritos na leitura — localStorage E tuning.json importado; appearance-shot prova a migração injetando paths antigos). + **`Docs/06-guia-estados-animacao.md`**: manual do painel de animação (modelo mental física→estado→clipe, os 5 estados e gatilhos, convenção de NOMES de clipes p/ o Studio (idle/walk/run/pray por regex), parâmetro a parâmetro com regras de bolso, receitas prontas, qp e sondas). Verificado: typecheck, prefs-probe 7/7, states-probe nos 2 backends, screenshot do painel EN | ✔ 2026-07-13 |
| M4a–f | **Interação, Vocabulary e terreno vivo** (doc 03 §14.6, doc 04 §4.2, doc 06 §Vocabulary): (a) **cores novas no Appearance** — dormentes, cinza do destaque, fios fraca/forte, labels seguem núcleo/cor fixa; (b) **Vocabulary** — papéis idle/idle2/walk/run/pray remapeáveis por dropdown (todos os clipes A++B), `role` declarável por clipe no VAT Studio (`clips[].role` no vat.json, precedência painel > role > nome), playback × por estado (via FASE — sem buffer novo, orçamento TF intacto) e 2 regras `elemento → clipe (peso)`; **sorteio do gesto migrou do shader p/ CPU** (meta.y = gesto: −1 idle, ≥0 índice global; mulberry32 estável por slot); (c) **hover com nome** — pessoa real mais próxima do mouse (raio 1,2 m) ganha billboard com nome (fade 0,25 s, cache de textura, cursor pointer; dormentes não respondem); `positionMirror` novo (readback contínuo ~60 Hz com guarda; stride 4/3 por backend; espera o 1º compute — senão quebra o TF do WebGL2); (d) **click→follow 3ª pessoa** — transição 1,2 s smootherstep mantendo azimute, lock soma delta da pessoa em target+câmera com OrbitControls LIGADO (órbita/zoom livres), ESC/clique no vazio solta sem teleporte, clique≠arrasto (<6 px/<400 ms), `?follow=<i>`; (e) **timeline da história** — bottom-center no follow (Legend desvanece — uma voz por vez), `personStore` com fetch+cache de `people/<id>.json`, pontos nos beats (`t_norm`) coloridos por valência (rampa fria→quente), anel na virada, hover=resumo+rótulo emocional, clique seleciona (v1 visual, áudio é a próxima etapa), linha com atração ao mouse (SVG, eco do menu cables), nome+entrada/saída à esquerda; (f) **terreno vivo** — `heightfield.ts` h(x,z) 2× mesma matemática TSL+JS (hash PCG uint32 dos dois lados, paridade medida ~2e-6), chão = 1 mesh (`positionNode` + normal por diferenças finitas + **grid TSL** fract/fwidth célula 0,25), sim escreve `y=h(x,z)` (reset+update; fios/render/espelho herdam), flatten central (anfiteatro, doc 04 §1.1), grupo Terrain com presets (plains/dunes/ridged/valley — só mudam params), `?terrain=`/`?terrainAmp=`, amplitude 0 default = paridade; FPS 60→60 nos 2 backends. Probes states/paridade/prefs verdes; screenshots `shots/m4*-*.png`, `shots/terrain-*.png` | ✔ 2026-07-13 |
| Fix M4c/d | **3 bugs de sensação do hover/follow** (relato do Dudu, doc 03 §14.6): (1) hover impreciso — picking era "mais próximo do ray NO CHÃO em XZ" e errava tronco/cabeça (ray aterrissa metros atrás do corpo) → **picking screen-space** (elipse do tamanho aparente do corpo em px, desempate por profundidade; cabeça acerta, era o caso que falhava); (2) **snap no fim da transição** — `controls.enabled=false` fazia o drei pular o `update()` e NADA girava a câmera durante a viagem (posição andava, olhar congelado; o 1º update() do lock aplicava 12,6–23° medidos num frame) → **rig sem fases com springs criticamente amortecidas** (âncora+offset+pessoa; lookAt todo frame; lock = spring convergida — sem costura por construção; pessoa→pessoa contínuo das MESMAS springs; resíduo de damping de arrasto anterior é descartado no clique — aplicado dava spike de ~4°); (3) **jitter em multidão densa** — lock copiava delta cru do positionMirror (escada da latência variável do readback + separação) → `getPosSmooth()` (interpolação entre as 2 últimas amostras com timestamp) + spring `follow smoothing` (default 0,35 s). Sliders novos no grupo Scene via pref() (`?followSmooth=`/`?followEase=`). **Sondas** (2 backends, fluxo real via `__limiarFollow(i)` + mouse real no pixel projetado): `follow-probe.mjs` — hover tronco+cabeça+vazio PASS, transições contínuas (nenhum frame destoa 3× dos vizinhos; deltas normalizados pelo Δt real), lock 5 s desvio ~1–3 mm e 0% frames congelados (antes 30% no WebGPU denso), órbita durante follow viva, ESC sem teleporte; `follow-settled-check.mjs` — **meta do relato: seguindo pessoa assentada em grid denso (sep 3,5), tremor >4 Hz p95 = 0,85 mm (WebGPU) / 0,09 mm (WebGL2), 0% vaivém** (meta <2 mm). Typecheck+build ok; screenshots `shots/m4fix-*.png` | ✔ 2026-07-13 |
| Timeline v2 | **Timeline clean com estações canônicas** (feedback do Dudu, 2026-07-14: "item demais espremido… quero algo mais clean… coisas padronizadas entre as pessoas"; doc 04 §4.2): (1) **estações canônicas** como default — Antes · A morte · O outro lado · A virada · O retorno · Depois, mesmos nomes/ordem para todas as pessoas, derivadas de `beats[].type` + `arc.virada` (`src/ui/timelineStations.ts`; types reais do corpus: contexto/evento_morte/eqm/retorno/integracao — não há outros; cobertura 85/74/85/82/78/84 de 85; âncoras "após" por beat_index seguram multi-parte tipo ivy-ueno; virada coincidente vira anel da estação); (2) **filtro de consumo** — texto-botões acima da linha (rádio antigo): estações · momentos (todos os beats, sem rótulo) · elemento da lente ativa (quotes com t_norm do JSON da pessoa; sem o elemento = linha vazia, honesto); `Scene.tlmode` pref()-wrapped + `?tlmode=`; crossfade na troca; (3) **layout clean** — sem retângulo: linha flutua bottom-center ~48vw com drop-shadow, nome caixa-alta minúscula à esquerda, entrada/saída do arco viraram tooltips dos EXTREMOS (tiques que acendem), resumo só no hover (crossfade padrão Legend), atração ao mouse mais sutil (amp 13→7). Rótulos por largura real em ≤3 linhas (estações amontoadas no início não colidem). Verificação: typecheck, prefs-probe 7/7, follow-probe 2 backends TUDO PASSOU, screenshots `shots/tl2-*` (Tânia 79 beats, Mário 5, extremos, elemento) + `scripts/tl-shot.mjs` novo (screenshot com hover) | ✔ 2026-07-14 |
| Lote 4 | **Corpus de 86 pessoas** (150 vídeos, ~114,7h) — +20 pessoas por diversidade (25 vídeos novos, ~18,7h, 0 falhas): +7 homens (lote 13F/7M; total 38M vs 47F), 2 infantis (1–3 anos; 7 anos), ateu→cientista, 2 EQMs aos 70, afogamento, túnel explícito, Alemanha+OVNI, alerta sobre IA em EQM, tons sombrios ("umbral", "Deus, me leve"). Re-análise: **13 núcleos** — "Os jardins de luz" 25, "As experiências na escuridão" 12, "Entre a vida e o coma" 10, "Os que despertaram na infância" 9, "Os que observaram de fora" 7, "Os que tocaram a água" 5, "As múltiplas travessias" 4, "Os lugares difíceis"/"Os que pediram para partir"/"As memórias que ficaram"/**"Os que atravessaram o túnel" (novo)** 3 cada + 2 singletons ("O encontro com quem partiu"; "Sem experiência relatada" — **o clustering isolou sozinho o vídeo-lixo nayda-cabral**). **Ranking N/86: inefabilidade 80 (93%) no topo**; transformação 77, presenças 76, **missão caiu para 74** (86%, empatada com fora_do_corpo e retorno_decidido); clichês atrás: luz 50 (58%), passagem 38, parentes 34. Tom: 63 mista / 20 positiva / 3 angustiantes. Export manifest `c1dfc4808073d5fa`, 2969 beats, **6653 cortes de áudio (4,4 GB)** — os 5389 antigos intactos. **Custo real ≈ US$ 12,0 ≤ teto de US$ 20** (transcribe ~8,0 + extract ~3,5 est. dry-run + demographics 0,25 + arc 0,25). Pendências de curadoria novas na seção abaixo (13 slugs sem nome, parser "EQM de" do group.py, +3 vídeos do Ricardo Pereira…) | ✔ 2026-07-14 |
| Lote 5 | **Corpus de 116 pessoas** (201 vídeos transcritos, ~153h) — +30 pessoas novas (51 vídeos, ~38,3h, 0 falhas após retries de rede) + 3 completações que o fix do parser destravou (Ricardo Pereira 1→4 partes, Altair Machado 1→3 com partes em inglês, Ivy Ueno 1→2). Seleção por diversidade: +9 homens (corpus 47M vs 68F), causas/temas incomuns (câncer terminal, gravidez interrompida, paralisia do sono, "morreu por 3 min", cego que enxergou na EQM, mar+OVNI), céticos/ateus, tons sombrios ("entrantes", "não humanize o que não é humano", "nós criamos o nosso mal", penumbra com 2 homens), e séries que o parser antigo perdia (Lázaro, COVID×2, KABBALAH, Liduína, Priscila Camargo). Re-análise: **13 núcleos** (HDBSCAN) — "Encontros com seres de luz" 55 (47%), "Entre dois mundos" 10, "Os que voltaram por amor" 8, "Saídas do corpo" 7, "As crianças que lembraram" 7, "Os céticos que atravessaram" 6, "A revisão da vida" 6, "As experiências difíceis" 4, "Os que pediram para partir"/"Consciência expandida"/"Mensagens do além"/**"Os que atravessaram o túnel"** 3 cada + 1 singleton ("Outros relatos" — o vídeo-lixo nayda-cabral). **Ranking N/116: inefabilidade 109 (93%) no topo**; transformação 106, missão 104 (89%), presenças 102, retorno_decidido 100; clichês atrás: luz 68 (59%), passagem 48, parentes 42. Tom: 81 mista / 32 positiva / 3 angustiantes. Export manifest `4e20ee9e761a689d`, 3944 beats, **9003 cortes de áudio** — os 6653 antigos intactos. **Custo real ≈ US$ 26,4 ≤ teto de US$ 28** (transcribe ~16,5 medido por 38,3h × 0,43; extract 9,0 real por usage; demographics 0,40 real; arc 0,54 real). Pendências de curadoria novas na seção abaixo (≈20 slugs de título sem nome; nayda-cabral segue com 3 entradas — o fix corretamente NÃO fundiu o caso ambíguo) | ✔ 2026-07-14 |
| Multidão dirigível | **Campo do ativo + formações + fundação do palco** (doc 04 §5.9/5.10, doc 03 §14.7): (1) **campo de repulsão da pessoa seguida** por uniforms (2 backends; vizinhos <3 m: 31→12 WebGPU, 32→5 WebGL2) + **yield assimétrico** dos migrantes na separação (só WebGPU; `toVar()` obrigatório no ganho — inlinado custava 40→23 fps, com ele ≈grátis); (2) **formações dos dormentes** (dropdown wander/circle/corridor/clear + spacing, `?formation=`): alvos na infra do M3, assentam pela state machine (circle: dist média 0,84 m, 100% assentados em 60 s); corridor = sebes de 3 camadas ANCORADAS no mundo (re-ancora a cada ~35% do comprimento; heading por trilha 2 s ≥1,2 m — EMA por frame girava com o jitter, pego na sonda); (3) **palco/esteira experimental** (`?stage=1` + follow + estados auto): pino (0,003 m/3 s) com walking forçado e passo casado, **scroll do heightfield com paridade TSL+JS** (noise+grid deslizam, anfiteatro fica; Δ3,08 m/3 s @ 0,9) e dormentes da janela em **wrap modular** (cenário em loop). Grupos leva Active field/Formations/Stage (treadmill), tudo pref(); sondas novas `field/formation/stage-probe.mjs`; states/follow-probe verdes nos 2 backends; visão completa do M6 "cenas de história" (bend cilíndrico→túnel, ambientes por beat, objetos em loop) registrada no doc 04 §5.10 | ✔ 2026-07-14 |
| Voz v1 | **A voz entra — clique na timeline TOCA o corte** (doc 04 §4.2 item 4, doc 03 §14.8): 6.644 cortes do corpus de 86 (manifest `c1dfc480…`) re-encodados **mp3 96k → Opus mono 32 kbps** (`-application audio`; SDR 16–18 dB, voip pontuava 7–11) = **1,58 GB** (beats 1,40 + quotes 0,18 + whisper 3 MB) e hospedados no **bucket público `audio-cortes`** do Supabase NDE (org no plano Pro, 100 GB — coube tudo, quotes incluídas). Pipeline `scripts/audio-sync.mjs` IDEMPOTENTE (staging /tmp/limiar-opus, escrita atômica, sobe só o que falta — re-rodável após o Lote 5); auth do upload = anon key + policies TEMPORÁRIAS de insert/update abertas via MCP e derrubadas ao final (ritual no doc 03 §14.8); disponibilidade via `_index.json` no bucket. App: `src/audio/player.ts` (singleton, fades 120 ms, última chamada vence) + `src/audio/cuts.ts` (base `?audio=` > `VITE_AUDIO_BASE` > bucket; mapeamento audio.beats posicional / audio.quotes por índice ORIGINAL) + StoryTimeline: ponto tocando pulsa (halo) e vira **anel de progresso SVG**, re-clique para, troca crossfada, ESC/sair do follow cala, mute PT minúsculo à direita dos modos, ponto sem corte = "sem áudio ainda" honesto. Gancho dev `__limiarAudioBeat` pronto p/ o "cair na morte". Sonda `scripts/voz-probe.mjs` verde nos 2 backends; sanidade manual: cortes casam com os resumos dos beats | ✔ 2026-07-14 |
| Mundo-toro + leme | **Adendo do Dudu: o follow vira palco padrão** (doc 04 §5.9/5.10, doc 03 §14.9): (1) **wrap universal** (`world wrap`, default ON, `?wrap=`): mundo-toro numa área canônica (lado 2×contenção); qualquer agente cruza a borda e reaparece do oposto (`wrapDeltaTSL`, 2 backends), contenção radial desliga; seek/mouse/campo com delta toroidal; **noise TILEADO** no período L com paridade TSL+JS (`h(x+L)=h(x)` exato — chão combina na costura); (2) **esteira é o follow PADRÃO** (kill-switch `follow treadmill`): pessoa pinada anda/corre no lugar e o **mundo inteiro** recua+wrappa (não só uma janela), chão scrolla em lockstep (u.dt=dtc), alvos no ground frame; (3) **leme do mouse** (`mouse steering`): ponteiro→chão gira o `stageHeading`; **distância** modula `stageSpeed` (`steer speed ramp`, walk→run no pino >55% do teto); deadzone 1,5 m para parar; modo legado empurra a própria pessoa com teto proporcional; (4) **inércia do selecionado** (`selected inertia` 0,15): escala separação+contenção RECEBIDAS pelo seguido — mata o stutter (medido 8,0→4,0 mm, 3→1 reversões); (5) **story field** (off/attract/repel, modo livre): com-história atraem/repelem dormentes no loop de separação (lê `agentMeta[j].x`, WebGPU); (6) **debug areas** (`?debugAreas=1`, `DebugAreas.tsx`): quadrado do wrap, círculo de contenção, anéis dos núcleos, campo e rumo (LineLoop→Line: WebGPU não suporta LineLoop). Sonda nova `coh-probe.mjs` (wrap/stutter/steering) + `follow-probe`/`field-probe` verdes nos 2 backends; FPS: 1024=60 sem mudança, wrap on≈off e story on≈off (custo ~0; 4096 sob throttle térmico da sessão); screenshots `shots/coh-*`. **Nota de coordenação:** CrowdMesh.tsx/CrowdWires.tsx tinham só MINHA fiação (git diff) — commitei-as; os arquivos da Hierarquia (colorEmphasis/legendStore/clusterFormation/positionMirror.simRef/hier-fps) ficaram intactos e NÃO commitados | ✔ 2026-07-14 |
| Hierarquia visual | **Rótulos sem sobreposição, foco no núcleo, contornos e LOD de dados** (doc 04 §5.11/5.12, doc 03 §14.10): (1) **anti-colisão dos rótulos em screen-space** — projeta os ≤13 centros/frame, o núcleo MAIOR fica e o menor SOBE por spring (offset px→mundo pelo UP da câmera) + fade por aglomeração + escala decrescente com a distância (medido: 7 pares sobrepostos → **0**, 2 backends); (2) **rótulo clicável → FOCUS** (`ClusterFocus.tsx`, rig próprio, NÃO toca o FollowCamera; voo 1,4 s smootherstep preservando azimute, bloqueado em follow) + destaque persistente (`triggerLegendFlash` com hold **Infinity** + `clearLegendFlash`) + **painel de foco** (`FocusPanel.tsx`, irmão da Legenda, PT) com a **ASSINATURA por LIFT** (top-6 elementos que distinguem o núcleo — % no núcleo ÷ % no corpus) como chips; **sublente por interseção** (chip → núcleo ∩ elemento, novo `kind:"clusterElement"` no colorEmphasis); ⌖ nos chips da Legenda; (3) **contornos** (`ClusterOutlines.tsx`): círculo no chão (raio máximo dos membros + folga), respira, amostra 0,3 s, positionMirror sem readback novo; (4) **LOD "vista de dados"** (`DataViewDiscs.tsx`): acima de `data view height` (55) as pessoas crossfadam para DISCOS no chão — instanced 1 draw call lendo `sim.positions` (storage PBO, zero CPU), cor reconstruída por `fillContentAttributes` (dívida: sem HSB/lente v1). **Sinal de formação extraído p/ módulo compartilhado** (`clusterFormation.ts`, lê positionMirror — um readback A MENOS que antes). Montado em `App.tsx` (sim via `positionMirror.simRef`, params via `levaStore`) — **CrowdMesh/CrowdSim/FollowCamera intactos**. Grupo leva "Focus & reading" (pref-wrapped). Custo ~grátis (4096 WebGL2 57,7 OFF vs 57,8 ON; birdseye 60). typecheck/lints ok; follow/prefs/states-probe verdes nos 2 backends; screenshots `shots/hier-*` (2 backends) | ✔ 2026-07-14 |
| Doc 07 — parâmetros | **Guia dos parâmetros** (`Docs/07-guia-parametros.md` + espelho; pedido do Dudu, 2026-07-14): manual do resto do painel leva — Scene, Crowd, Field · physics, Witnesses, Dormants, coupling, Stage, Focus & reading, Appearance, Terrain, Effects, Preferences. Irmão do doc 06. Atualizado 2026-07-15 com wander por grupo | ✔ 2026-07-14 |
| Wrap anti-flicker | **Costura do toro mais natural** (2026-07-15): separação toroidal opcional (`toroidal separation`, default ON), histerese no teleporte (`wrap seam margin`, default 0,8 m), formações recuadas da costura (`rim inset (wrap)` em Dormants, default 1,5 m). Leva: Field · physics + Dormants; qp `wrapSep`/`wrapHyst`/`rimInset`. `npm run typecheck` ok | ✔ sessão 2026-07-15 |
| Wander por grupo | **Curl e lock separados testemunhas/dormentes** (2026-07-15): `wander variance` / `wander pauses` / `speed variance` por grupo (Witnesses espelham Dormants com defaults próprios); pausas desligam na migração; `wander scale` max dormentes 0,8. Doc 06/07 | ✔ 2026-07-15 |
| Story field social | **Atração + bolha interna** (2026-07-15): `story field` modo `social` (attract externo + repel interno `story bubble radius`); `attract` legado migra p/ `social`; leva condicional (story controls só quando ligado). Doc 04 §5.9 | ✔ 2026-07-15 |
| UX follow + voz | **Escada §4.1 fechada no código** (2026-07-15): (1) **auto-play** — clique na testemunha toca o 1º beat com corte na ordem `t_norm` (sem 2º clique); (1b) **chain linear** — `onEnd` avança ao próximo ponto da régua (estações + momentos), não só capítulos; (2) **overview 750 ms**; (3) **zoom ease-in-out**; (4) **`pause on hover`**; (5) **névoa scrolla** no follow. `timelinePlayback.ts` + `StoryTimeline.tsx`. Doc 04 §4.1/§4.2 | ✔ 2026-07-15 |
| Skip vinheta áudio | **Seek no Opus, sem re-export** (2026-07-15): `scripts/intro-skip.mjs` lê transcripts → fim da frase fixa do canal; `sync-content` injeta `audio.beats[].skip_in` (153 cortes / 116 pessoas, mediana ~4,6 s); `player.play({ startAt })` + anel de progresso relativo ao skip. Só beats com `start ≤ 8 s`. Doc 04 §4.2 | ✔ 2026-07-15 |
| M4+ | **Sintonia** (§5.1, whispers já no bucket) e **Coro** (§5.2), Maré (beats→estados via slots z/w do agentMeta, já reservados), "cair na morte" (lendo `__limiarAudioBeat`), descoberta, constelação, polimento | pendente — ver adições do doc 04 §11 |

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
- **Curadoria (A5) — pendências do Lote 4 (2026-07-14)**:
  1. **13 slugs de título sem nome de pessoa** (ex.:
     `eqm-os-25-anos-de-luta-de-um-campeao`,
     `eqm-a-surpresa-do-ateu-hoje-cientista`,
     `a-conversa-com-um-ser-de-outra-dimensao-eqm-do-ricardo-pereira`…) —
     renomear na UI de revisão;
  2. parser do `group.py` só reconhece "EQM **de**" (perde "EQM **do**
     Ricardo Pereira") e exige "EQM" no título (partes em inglês de
     altair-machado 1/3 e ivy-ueno 2/2 ficam de fora) — completar pede
     ajuste no group.py ou merge manual;
  3. Ricardo Pereira tem **+3 vídeos no raw** (`39-Uw05nz4U`, `nSOYhTpnORo`,
     `oRuOvRD4xBs`) — transcrever sem ajustar o agrupamento criaria
     duplicatas (caso Nayda);
  4. `eqm-sim-voce-esteve-no-umbral`: arco com entrada None→saída 0 (único
     estranho do lote) — conferir na UI;
  5. erro pré-existente na fila: vídeo `nSBzLJodE8w` "Invalid storage type";
  6. confirmado NÃO-duplicata: `eqm-a-surpresa-do-ateu` ≠ `ateu-cientista`
     (pessoas diferentes, demographics distintos).
- **Curadoria (A5) — pendências do Lote 5 (2026-07-14)**:
  1. **≈20 slugs de título sem nome de pessoa** (o parser agora captura o
     nome quando ele está no título, mas muitos títulos do lote não têm):
     `eqm-assim-como-lazaro`, `eqm-em-covid`, `eqm-kabbalah`,
     `covid-2-eqms-projeto-com-vida`, `eqm-os-entrantes`,
     `eqm-tudo-e-matematica`, `eqm-paralisia-do-sono`,
     `eqm-a-gravidez-interrompida`, `eqm-nao-humanize-o-que-nao-e-humano`,
     `eqm-nos-criamos-o-nosso-mal`, `eqm-no-mar-e-a-visao-de-um-ovni`,
     `experiencia-de-quase-morte-na-penumbra-surgiram-2-homens`,
     `experiencia-quase-morte-aos-4-anos-de-idade`,
     `experiencia-quase-morte-ela-tinha-cancer-terminal`,
     `a-impressionante-eqm-da-liduina`,
     `a-reveladora-eqm-de-uma-pastora-evangelica`,
     `blind-he-saw-during-the-nde-carlos-roberto`,
     `ela-teve-duas-eqms-anamaria`,
     `ele-era-cetico-mas-ai-ele-teve-duas-eqms-eqm`,
     `ele-morreu-por-3-minutos` — renomear na UI de revisão;
  2. **fix do parser `group.py` aplicado e commitado** (87207a1 + fechamento):
     reconhece "EQM de/do/da/dos/das", caudas em inglês ("NDE by X", "X's
     NDE", "X NDE"), séries "1de2 / (1ª parte) / EQM 1de2 -", e une partes
     da mesma pessoa por nome próprio. **Zero regressão provada**: 83/86
     pessoas do Lote 4 byte-idênticas; só ricardo/altair/ivy mudaram (as
     completações intencionais). Âncora por vídeo→slug garante que slugs
     existentes nunca são re-slugificados;
  3. **nayda-cabral segue com 3 entradas** (`nayda-cabral`,
     `nayda-cabral-chegou-a-hora`, `nayda-cabral-nao-tenha-medo`) — o fix
     NÃO as fundiu de propósito (nome aponta p/ 3 pessoas-âncora distintas =
     caso ambíguo; conservador por design). Curar manualmente se forem a
     mesma pessoa. O vídeo-lixo `nayda-cabral` ("O que é orar", 0 elementos)
     continua isolado pelo clustering em "Outros relatos";
  4. **backlog**: 396 vídeos seguem em `raw` (lives, cortes/shorts,
     institucionais, séries do Dr. Edson Amâncio/entrevistas de terceiros,
     e depoimentos que ficaram fora deste lote por diversidade/custo). Não
     fazem parte do Lote 5 — próximos lotes escolhem daí.
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
- **Voz v1 no ar (2026-07-14)** — a pendência "áudio da timeline via
  Supabase" FECHOU: bucket `audio-cortes` público com os 6.644 cortes do
  manifest `c1dfc480…` em Opus 32k (1,58 GB; org no plano Pro, 100 GB).
  Sobras para depois: (a) **cortes do Lote 5** — quando o outro agente
  fechar o export, re-rodar o ritual do doc 03 §14.8 (abrir policies TEMP →
  `node scripts/audio-sync.mjs --upload` → derrubar policies): o script é
  idempotente e só sobe o que falta; (b) Safari < 17.4 não toca Opus/Ogg
  (aceito no protótipo); (c) staging /tmp/limiar-opus é descartável (se o
  macOS limpar o /tmp, a re-compressão leva ~25 min e o upload segue
  incremental).
- **M4 — positionMirror é o limite conhecido do hover/follow**: readback
  contínuo ~60 Hz funciona bem com 4096 agentes (~64 KB/frame), mas se a
  multidão crescer ou a latência incomodar, o upgrade é **picking GPU**
  (id-buffer num render target pequeno) — doc 03 §14.6. (A ESCADA da
  latência variável já foi tratada: `getPosSmooth` interpola as 2 últimas
  amostras com timestamp — fix M4c/d.)
- **M4 — timeline com labels sobrepostos** em histórias com beats muito
  próximos no tempo (stagger de 2 linhas já implementado; casos extremos
  podem precisar de colapso/zoom).
- **Hierarquia — sub-grupos REAIS dentro dos núcleos (HDBSCAN condensed
  tree)**: hoje o export do acervo é PLANO (cada pessoa → um núcleo). A
  sublente por interseção (doc 04 §5.11) faz o drill-down v1 via ELEMENTOS,
  mas "temas dentro de temas" de verdade pede exportar a **hierarquia do
  HDBSCAN (condensed tree)** no `analyze` do acervo — habilita sub-núcleos
  navegáveis. Não implementado (fora do escopo desta sessão; ticket para o
  acervo). Ver doc 04 §5.12.
- **Hierarquia — dívida da cor dos discos (LOD, doc 03 §14.10)**: os discos
  da "vista de dados" reconstroem a cor por `fillContentAttributes` (mesmas
  funções puras, seed do levaStore) porque o `iColorScale` da multidão é
  atributo do CrowdMesh (não editável em paralelo). v1 não reflete HSB
  global / lente / destaque do CrowdMesh; e a multidão real não some ao
  subir (o fade do material dela é ticket para o dono do CrowdMesh). Se o
  Dudu quiser paridade total, unificar quando o CrowdMesh estiver livre.

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

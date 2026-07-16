# Briefing de Implementação — Experiência 3D (React Three Fiber + WebGPU)

> **Para:** Claude Code / Cursor. **Pré-requisitos de leitura:** `docs/00-visao-geral.md` (contexto) e `docs/01-conceito-experiencia.md` (o design que este código serve — em conflito, o doc 01 vence).
> **Objetivo:** portar as técnicas do patch original em cables.gl (VAT + simulação de multidão GPGPU + instancing) para React Three Fiber com WebGPU/TSL — e superá-las: evitação entre agentes, estados de animação dirigidos por narrativa, posições-alvo por clustering semântico, modo follow com áudio sincronizado, modo constelação. Tudo alimentado pelo `export/` do pipeline (doc 02), nada hardcoded.
> **Método:** marcos (seção 12), um por vez, commit + tag por marco.

---

## 1. O que herdamos do patch cables (referência)

> **ERRATA (verificado contra o grafo real do patch — ver `ANALISE_TECNICA.md`):**
> 1. A malha tem **1590 vértices** (530 triângulos, triangle soup sem índices) — não 256. "256" no nome do arquivo refere-se ao tamanho da multidão (grade 16×16).
> 2. A VAT usada em produção é a **`..._ANIM_*360f.exr` (1590×360): 6 clipes de 60 frames empilhados verticalmente**, selecionados pelo slider "Posed Animations". A `WalkCycle28f_Dying28f` (1590×56) é legado (só empresta a largura). Conteúdo dos 6 blocos **identificado visualmente no M0**: 0 = idle · 1 = andar (default do patch) · 2 = idle variação · 3 = queda/morte (one-shot, termina deitado) · 4 = levantar (one-shot, do chão a mãos juntas) · 5 = rezar (loop). Cobre a máquina de estados inteira do doc 01 §4.
> 3. Este export **não usa** RGBE8 nem normais compactadas no alpha (`XYZ is RGB = 1`) — EXR float direto. O prebuild é mais simples que o descrito abaixo.
> 4. Transformação de espaço necessária ao amostrar o EXR cru: `pos_final = M × (raw − (0.37, 0.40, 0.37))`, onde M = rotação X 90° (feita em compose no patch) combinada com o swizzle `.xzy` (feito no shader). Confirmar sinal empiricamente no M0.

- **VAT (Vertex Animation Textures):** personagem low-poly sem esqueleto; animações assadas em EXRs vindas do Houdini (linha = frame, pixel = posição XYZ do vértice; pares positions+normals). Clipes: 6 blocos de 60 frames ("Posed Animations 0–5"). Vertex pulling via `gl_VertexID`. Offset de fase por instância (`instanceIndex / 82.5`) para dessincronizar a multidão.
- **Simulação GPGPU:** posições dos agentes em texturas (ping-pong de snapshot), matemática RGB=XYZ, campos de força (repulsão esférica, ruído/wander), histórico de posições para derivar direção, distance check para conter a área, spawn por ruído.
- **Instancing:** mesh instanciado lendo posição/rotação/cor das texturas da sim; rotação orientada pelo vetor de movimento; cor por instância; descarte barato (alpha baixo → posição 999999).
- **Cena:** raycast do mouse no chão como alvo, PBR com env HDR, céu FBM procedural, fog, pós leve (vignette).

Manter paridade visual com isso é o M1. Tudo depois é evolução.

## 2. Stack

- Vite + React 19 + `@react-three/fiber` v9 + `three` com **WebGPURenderer + TSL** (Three Shading Language)
- **Fixar a versão exata do three no package.json** (a API TSL evolui rápido; encapsular todo TSL em módulos próprios para facilitar upgrades)
- WebGPU primeiro; **fallback WebGL2 automático** (TSL compila para WGSL e GLSL — vantagem decisiva desta stack)
- Estado: `zustand` · Debug/admin: `leva` · Utilitários: `@react-three/drei`
- Áudio: WebAudio nativo (contexto próprio; `PannerNode` para sussurros posicionais; players simples para o follow)
- Persistência de progresso do visitante: `localStorage` (elementos colhidos, pessoas ativadas, favoritos)

## 3. Assets e pré-processamento

Adicionar um passo `prebuild` (script Node) que converte os EXRs de VAT em **texturas float16 raw (.bin + descriptor JSON)** carregáveis direto em `DataTexture` — elimina exrloader/fflate em runtime e a decodificação RGBE no shader. O descriptor guarda: vertexCount (256), frames por clipe, layout (linha=frame), ranges de cada clipe, se normais estão empacotadas. Manter os EXRs originais em `assets-src/` como fonte da verdade.

Env HDR: usar um equirect HDR padrão do three (o `lib_hdr_spree_bank` do patch pode ser substituído por equivalente com licença clara).

## 4. Arquitetura de módulos

```
src/
  vat/        # VATClipLibrary + node TSL de posição/normal por vértice
  sim/        # CrowdSim: compute passes, buffers de agentes, forças, state machine
  data/       # loader do export/ (manifest, people, layout, graph, stats)
  director/   # narrativa: follow, beats→eventos, coleta, revelação, progresso
  render/     # instancing, fios, ambiente (céu/fog/env), post
  ui/         # HUD diegético, Diário, filtros, painel admin
  audio/      # sussurros posicionais, player de beats, cama generativa
content/      # cópia do export/ do pipeline (público, hot-reload em dev)
```

### 4.1 `vat/`
Função TSL `vatPosition(clipA, clipB, blend, phase, speed)`: amostra a textura de posições por `vertexIndex` + frame; **lerp entre frames adjacentes** (o patch não fazia — movimento mais suave de graça); **crossfade entre dois clipes** (0.2–0.4s) para transições de estado sem pop; idem para normais. Suporte a one-shot com hold no último frame (estado "no chão").

### 4.2 `sim/` — o coração
Storage buffers por agente: `position`, `velocity`, `stateId`, `stateTime`, `clipA/clipB/blend`, `phase`, `speedScale`, `targetPos`, `personIdx`, `activation` (0–1), `color`.

Compute passes por frame:
1. **Build spatial hash grid** (célula ≈ raio de separação) — chave da melhoria pedida.
2. **Forças:** separation (vizinhos da grid — *agentes desviam uns dos outros*), wander (curl noise), seek(targetPos) com arrival/damping, contenção de área (o "distance check" reencarnado), vortex (toggle, paridade com o patch), repulsor/atrator do mouse (raycast no chão).
3. **Integração** + orientação pelo vetor de velocidade (com giro suavizado, não snap).
4. **State machine:** transições dirigidas pelo `director/` (via buffer de comandos ou uniforms indexados) — idle→walking→dying→down→rising→praying; cada transição seta clipA/clipB/blend.

Detalhe de cena barato e poderoso: quando em follow, agentes próximos ao seguido reduzem velocidade e abrem caminho (peso extra de separation) — a multidão *respeita* quem está contando sua história.

### 4.3 `data/`
Carrega `content/manifest.json` e materializa: mapping pessoa↔slot de agente, cores por cluster, `targetPos` = `umap3d` (escala configurável), arestas do grafo. Detecta manifest novo (arquivo vivo): pessoas novas nascem na borda da névoa e caminham para dentro.

### 4.4 `director/`
- **Despertar:** proximidade ou clique em dormente → ativa pessoa, entra em follow.
- **Beats:** ao tocar o áudio de um beat, agenda eventos nos timestamps: troca de estado do agente (queda no `evento_morte`, hold no `eqm`, levantar no `retorno`, rezar na `integracao`), eventos de mundo (pausa coletiva de 2s na morte; mudança de luz/névoa conforme `tone`).
- **Coleta:** elemento é colhido quando seu quote foi ouvido; atualiza Diário + revela fios (arestas com aquele `shared_element`).
- **Gravidade progressiva:** após limiar configurável, ativados passam a fazer seek do `targetPos` de cluster (interpolação lenta — organismo, não refresh).
- Persistência em localStorage.

### 4.5 `render/`
- **Um draw call para a multidão:** InstancedMesh com material TSL lendo os storage buffers (posição/rotação/cor/VAT). Dormentes: dessaturados (mix por `activation`).
- **Fios:** LineSegments a partir de buffer de arestas; alpha por descoberta; endpoints seguem os agentes (lidos dos buffers na GPU).
- **Ambiente:** chão com recebimento de luz simples + blob shadow fake por instância (decal/plane — sem shadow map no início); céu FBM procedural (node TSL — paridade com o patch); fog exponencial; env PBR.
- **Post:** vignette sutil. Nada além disso até M7.

### 4.6 `ui/`
HUD mínimo e diegético (doc 01 §5–6): Diário invocável (elementos, filtros, favoritos), indicador discreto de follow, botão de escala. **Painel admin** (leva, atrás de `?debug`): tuning de todas as forças/visual com save em `content/tuning.json`; toggles de paridade com o patch (debug, showCables, vortex).

## 5. Tabela estado ↔ clipe VAT

| stateId | Clipe | Modo | Observações |
|---|---|---|---|
| idle | Pose idle | loop sutil | dormentes; variação de fase |
| walking | WalkCycle 28f | loop | `speedScale` acopla velocidade da sim ao playback |
| dying | Dying 28f | one-shot | disparado por beat `evento_morte` |
| down | Dying último frame | hold | durante beat `eqm` |
| rising | Dying reverso (ou clipe próprio se existir) | one-shot | beat `retorno` |
| praying | Pose praying | loop sutil | beat `integracao` e estado final de ativados no cluster |

Transições sempre via crossfade; fases preservadas para não sincronizar a multidão.

## 6. Câmeras

- **Livre:** orbit + WASD (paridade com o patch).
- **Follow:** rig suave atrás/ao lado do agente seguido; aproximação de enquadramento em beats-chave (queda, levantar); sem colisão complexa — só altura mínima e damping.
- **Constelação:** dolly vertical contínuo; conforme sobe, escala das figuras ↓, pontos+fios ↑ (morph de representação, não teleporte); no topo, layout muda para `umap2d` elevado; overlay de stats (`stats.json`). Descer inverte tudo. Transição inteira scrubbável pelo gesto.

## 7. Data-driven e editável (requisito central do criador)

Nenhuma história, cor, posição ou texto de elemento no código. Tudo vem de `content/` (cópia do `export/` do pipeline). Hot-reload em dev. `content/tuning.json` versionado separa parâmetros estéticos de conteúdo. Trocar o corpus inteiro = trocar a pasta. Isso garante o "evoluir, alimentar, editar de forma intuitiva" pedido no projeto.

## 8. Performance

- Alvos: desktop WebGPU **1.000+ agentes @ 60fps**; fallback WebGL2 ~300; mobile 128–256 @ 30fps (auto por device, override via query param).
- Multidão em 1 draw call; fp16 nos buffers onde possível; sem shadow maps (blob fake); `stats-gl` no modo debug; medir cada marco.

## 9. Fallback e compatibilidade

Detectar WebGPU → senão WebGL2 (mesmos nodes TSL). Testar Chrome/Edge/Firefox/Safari TP. Autoplay de áudio: gesto inicial obrigatório ("toque para entrar" — que já é o fade-in do Ato 0). 

## 10. Riscos e mitigações

- **API TSL instável** → versão do three pinada; TSL encapsulado em `vat/` e `sim/`; upgrade é tarefa isolada.
- **EXR em runtime** → resolvido pelo prebuild (seção 3).
- **Compute no fallback WebGL2** → TSL emula compute via texturas onde possível; se inviável para a grid de hash, WebGL2 usa separation aproximada (n² em subgrupo ou skip) com contagem reduzida — decisão documentada no M2.
- **Áudio dessincronizando dos estados** → beats agendados pelo clock do áudio (`AudioContext.currentTime`), nunca por frame count.

## 11. Definição de conteúdo mínimo para dev

Antes do export real existir, `content/` inclui um **corpus fake gerado por script** (`scripts/fake-content.mjs`): 200 pessoas sintéticas com beats, elementos, layout aleatório-mas-clusterizado e áudios placeholder (tons). O contrato é o mesmo do doc 02 §10 — quando o export real chegar, é drop-in.

## 12. Marcos

| Marco | Entrega | Critérios de aceite |
|---|---|---|
| **M0** | Boot: R3F + WebGPU + fallback; prebuild de assets; 1 personagem VAT | Walk cycle correto em loop, com lerp interframe; roda em WebGPU e WebGL2 |
| **M1** | Multidão instanciada | 1.000 instâncias com offset de fase e cor por instância; paridade visual com o patch cables; 60fps desktop |
| **M2** | Simulação compute | Agentes vagam, **desviam uns dos outros** (hash grid), respeitam contenção; toggle debug visualiza a grid; mouse atrai/repele |
| **M3** | Data layer | Cores, alvos e fios vindos do `content/` (fake); clusters visíveis quando gravidade forçada por debug |
| **M4** | Follow + beats | Uma história completa: despertar → seguir → queda na morte → hold → levantar → rezar, sincronizada ao áudio; pausa coletiva na morte |
| **M5** | Descoberta | Coleta de elementos ao ouvir quotes; Diário; fios revelados; gravidade progressiva por limiar; persistência local |
| **M6** | Constelação | Transição de escala scrubbável; stats overlay; clicar ponto → descer para a pessoa |
| **M7** | Polimento | Céu FBM, fog, cama sonora, sussurros posicionais, vignette, Ato 0 completo (fade branco + texto único) |

## 13. Estrutura de repositório e convenções

`limiar-experience/` com `docs/` (00, 01, 03), `CLAUDE.md` apontando para eles, TypeScript estrito, ESLint+Prettier, commits convencionais, tag por marco (`m0`, `m1`, …). Smoke test opcional com Playwright (página carrega, canvas presente, sem erros de console) a partir do M2.

## 14. Ferramentas e evoluções pós-M3 (2026-07-12)

> Seção aditiva — registra decisões técnicas das sessões de 2026-07-12 sem
> mexer na numeração histórica (§1–13). Fatos verificados vivem no
> `limiar-experience/AGENTS.md`; aqui fica o *porquê* e o desenho.

### 14.1 VAT Studio — o guarda-roupa de animações é nosso

O gargalo de assets (depender de Houdini para assar VATs) foi eliminado com
ferramenta própria: motor `tools/vat-core.mjs` + **VAT Studio** (UI local em
`localhost:5198`, `npm run studio`) + CLI `tools/vat-bake.mjs`. Pipeline:
GLB (Mixamo ou qualquer skinned mesh) → texturas float16 `.bin` + descriptor
JSON, drop-in no app via `?vat=<nome>`.

Decisões de design da ferramenta:

- **Orçamento de performance inteligente, não censura:** semáforo
  (vértices / colunas de textura / download) com **presets de intenção**
  (multidão × personagem próximo) e **decimação em 1 clique**
  (meshoptimizer, antes/depois lado a lado). O artista vê o custo antes de
  assar; a ferramenta educa em vez de bloquear.
- **Root motion, resolvido de vez:** o bake é **in-place** (raiz travada) e
  a **trajetória da raiz é exportada à parte no descriptor**. Na multidão, o
  movimento SEMPRE vem da simulação (in-place é o contrato); a trajetória
  fica disponível para **one-shots dirigidos** (câmera/director puxando um
  gesto específico) sem re-assar nada.
- **Track único combinável:** clipes de GLBs diferentes podem ser
  **combinados num único track VAT** (ferramenta `tools/merge-clips.mjs`) —
  é assim que o "guarda-roupa" (idle/andar/correr/gestos) de fontes soltas
  vira um asset coeso. Deletar/renomear/reordenar clipes já existe no
  Studio. Na fila: importar FBX direto (hoje: converter para GLB antes).
- **Regra dura de morph:** crossfade A/B entre clipes **exige malha
  idêntica** — mesmo `meshHash` no descriptor (mesma soup de vértices; a VAT
  só troca posições). Consequência arquitetural: o guarda-roupa escala por
  **texturas paralelas da mesma malha** (N clipes × mesma geometria), nunca
  por uma textura gigante multi-malha. Personagens diferentes = descriptors
  diferentes = sem morph entre eles (por construção, não por bug).

### 14.2 Pós-processamento com orçamento dinâmico

Filosofia (Dudu): **efeitos bonitos e baratos — a experiência tem que ser
fluida em máquinas comuns, nunca "só roda numa 5090"**. O §4.5 dizia
"vignette e nada além disso até M7"; o caminho para o M7 fica registrado:

- **SSR/SSGI descartados** por custo/benefício: caros, frágeis na nossa
  cena (multidão + névoa), ganho estético marginal sobre luz bem dirigida.
- **Menu Effects com custo MEDIDO**: cada efeito exibe seu custo real em
  **ms por frame na máquina atual** (medido, não estimado) — decisão
  informada, no espírito do semáforo do Studio (§14.1).
- **Presets Mínimo / Leve / Médio / Alto** + **auto-degradação por fps**:
  se o frame rate cai abaixo do alvo, efeitos caem degrau a degrau na ordem
  inversa de custo×valor. O piso (Mínimo) preserva a leitura da cena —
  atmosfera é névoa+luz+cor, nunca dependente de post.

### 14.3 Fatos técnicos consolidados no M3 (referência)

Verificados durante o data layer (detalhe canônico no
`limiar-experience/AGENTS.md` — não re-derivar):

- **Transform feedback (compute WebGL2) tem teto de 4 varyings** — toda
  leitura de storage num pass TF vira attribute+varying no GLSLNodeBuilder.
  Os 4 slots já estão tomados (pos/vel/heading/phase); buffer novo lido
  pelo compute (ex.: targets do M3) entra como **DataTexture +
  textureLoad**, com o mesmo Float32Array espelhado nos dois recursos.
- **Storage buffer lido no vertex stage do render:** WebGPU permite direto
  (vira read-only); WebGL2 exige **PBO** (`.setPBO(true)` — o backend copia
  o buffer para DataTexture após cada compute). É assim que os fios seguem
  os agentes sem tráfego CPU↔GPU.
- Implicação para o roadmap: mecânicas novas que leem estado da sim no
  render (fios inteligentes, palavras no espaço, Maré — doc 04 §5.4–5.7)
  já têm o padrão de acesso resolvido nos dois backends.

### 14.4 Estados de animação por agente (M3.6 — a state machine do §4.2 na GPU)

A máquina de estados por agente do §4.2 saiu do papel (2026-07-12): pass de
compute PRÓPRIO (`buildStatePass`), separado do update de forças — no WebGL2
cada pass tem orçamento de 4 varyings de TF, e o state pass usa exatamente
states+phases+positions+velocities (a integração da fase migrou para ele; o
update ficou com 3). Buffer `states` vec4 por agente: clipA, clipB, blend e
stateId+stateTime empacotados (o crossfade A/B do M0.5 agora roda POR
INSTÂNCIA; o render lê como storage PBO no vertex — nenhum vertex buffer
novo). Transições dirigidas pela velocidade REAL com histerese e dwell;
chegada assenta em idle/rezar (sorteio estável, peso extra de rezar p/ quem
tem `transformacao` — o dado escolhe o gesto); onda de chegada = teto de
velocidade cresce com a distância ao alvo (longe corre, perto assenta);
pausas orgânicas de wander (sawtooth por agente) criam a multidão mista
parado/andando SEM script; dormentes têm multiplicadores próprios
(velocidade/wander). Clipes por PAPEL (`src/vat/clipRoles.ts`, match por
nome pt/en): o estado "correndo" usa walk + boost de playback enquanto a VAT
não tem clipe de corrida — quando o VAT Studio assar um clipe /corr|run/,
ele é detectado e o boost desliga sozinho. Toggle master no leva ("estados
automáticos"); off = os botões globais de estado continuam valendo (debug).
Beats por pessoa dirigindo os estados (queda/hold/levantar do doc 01 §4 no
Campo, além do follow) = Maré/M4: os slots z/w do agentMeta ficaram
reservados para valência/beat.

### 14.5 Aparência e preset persistente (2026-07-12 — pedidos diretos do Dudu)

**Preset persistente (o `tuning.json` do §4.6 realizado).** Grupo
"Preferências" no leva: *salvar como padrão* serializa TODOS os inputs de
valor do painel (qualquer grupo — toggles, sliders, dropdowns, cores) num
blob versionado no localStorage (`limiar.tuning`, formato
`{app:"limiar-tuning", version, savedAt, values:{"<Grupo.key>": v}}`);
*exportar* manda o MESMO blob para clipboard + download `tuning.json`;
*importar* cola o JSON, aplica na hora (set no levaStore) e persiste;
*restaurar fábrica* apaga e recarrega. Engenharia em `src/lib/prefs.ts`:
os defaults de TODO controle passam por `pref("Grupo.key", fábrica)` (ou
`prefNum/prefBool/prefStr("qp", "Grupo.key", fábrica)` quando existe query
param) — precedência **query param > salvo > fábrica**, então URLs de
screenshot seguem reproduzíveis. Merge por CHAVE e tolerante entre versões:
chave salva que não existe mais é ignorada, controle novo usa a fábrica,
tipo divergente cai na fábrica. **Regra para código novo: controle de leva
novo nasce com o default embrulhado em pref()** — é o que o torna
persistível. Sonda: `scripts/prefs-probe.mjs` (salva→reload→qp→fábrica).

**Névoa dominável.** O PostFX virou o dono ÚNICO da névoa (Scene.tsx não
declara mais `<fog>`): toggle **"névoa (master)"** — off = zero névoa (nem
a linear clássica, que antes ficava sempre acesa por baixo do efeito);
master on + efeito de altura off = THREE.Fog linear (paridade com o M0).
**Recuo por altura da câmera** (o "vistas de cima engolem tudo" do Dudu):
uniform `uCamY` alimentado pela câmera a cada frame + slider "névoa:
altura de recuo" (`?fogRecuo=`, default 16 m; 80 ≈ nunca) — camK =
smoothstep(recuo, 1.75×recuo, camY) desvanece a névoa de DISTÂNCIA
(×(1−camK)), satura o caminho óptico do banco em 2,5× a altura dele
(min(viewZ, 2.5×h) — de cima um raio só atravessa a espessura da camada,
não a distância inteira) e desliga o tri-noise (anisotrópico, de topo
viraria listras). Resultado: god view limpo com o chão ainda enevoado,
rente ao chão nada muda.

**Cores do mundo (grupo "Aparência").** Fundo/céu (não há dome — o céu É o
clear color), cor da névoa (segue o fundo por default, toggle solta),
chão, grid (cor + alpha; GridHelper assa cores em vertex colors → remonta
por key na troca; a 2ª cor mantém a razão ×0.84 da original). **HSB global
das pessoas**: matiz (°) / saturação / brilho aplicados à paleta de núcleos
E aos dormentes por re-escrita do `iColorScale` (rgb→hsl→ajuste→rgb em
`palette.applyHsbToColorScale`) — mesma via do colorEmphasis, CPU no evento,
zero custo por frame, zero shader novo.

**Destaque forte da legenda.** Clique no chip: selecionados mantêm cor
PLENA, todos os demais COLAPSAM para um cinza uniforme (mesmo tom
`FLASH_GRAY`, não dessaturação individual) — contraste máximo. Envelope
temporal: hold pleno (slider "destaque: duração") → fade-out suave 0,7 s
(smootherstep, repinta o iColorScale só enquanto o valor anda — ~40 frames
de CPU barata). Slider "destaque: intensidade" (0..1) dosa o colapso; a
camada da lente (dessaturação 35% dos não-pertencentes) é cruzada pelo
envelope — sem pop no fim do fade. Headless: `?flash=cluster:5`
(`demo:i`/`side:has|not`) + `?flashDelay=` + `?flashHold=`.

**Só quem tem história.** Toggle na Multidão: `mesh.count` cai para o nº de
pessoas reais — pessoa i = INSTÂNCIA i por construção do M3, e a permutação
de spawn (`i×197 mod count`) embaralha só a POSIÇÃO inicial, não a
identidade do slot, então desenhar os primeiros 46 desenha exatamente as 46
pessoas. A sim continua inteira (dormentes seguem ocupando espaço e
empurrando — corte de desenho, não de simulação); fios e labels seguem
válidos (só referenciam índices < 46). `?onlyPeople=1`.

### 14.6 Interação, Vocabulary e terreno vivo (M4a–f, 2026-07-13)

**positionMirror (`src/sim/positionMirror.ts`)** — espelho CPU das posições
dos agentes: readback `getArrayBufferAsync(positions)` CONTÍNUO com guarda
de inflight (um em voo por vez; ao completar, agenda o próximo no rAF —
~60 Hz efetivo, latência 1–3 frames). Singleton com refcount
(`acquire()`/release) — só roda enquanto hover/follow precisam. Stride 4
(WebGPU, padding vec4) vs 3 (WebGL2/TF packed) detectado pelo tamanho.
**Armadilha aprendida:** um `getArrayBufferAsync` ANTES do primeiro compute
registra o attribute vazio no cache do backend WebGL2 e o compute quebra
(`switchBuffers is not a function`) — o mirror espera `sim.u.time > 0`.
**Fix M4 (2026-07-13): a latência VARIÁVEL do readback vira "escada" se
lida crua** — a mesma amostra segura 1–3 frames e chega um salto com o
acumulado; era metade do jitter do follow em multidão densa. O espelho
guarda as DUAS últimas amostras com timestamp e `getPosSmooth()` re-fasea
entre elas pelo tempo desde o readback (extrapolação ≤25% do período; salto
>2 m = teleporte de reset, adota direto). Hover/follow/timeline leem SEMPRE
`getPosSmooth`, nunca a crua; se um dia o espelho mostrar limite, o upgrade
é picking GPU (pendência).

**Vocabulary (M4b)** — os papéis de clipe (idle/idle2/walk/run/pray) têm
precedência painel > `role` declarado no descriptor (dropdown por linha no
VAT Studio → `clips[].role` no vat.json) > regex por nome. O **sorteio do
gesto de assentamento migrou do shader para a CPU**: `agentMeta.y` deixou
de ser probabilidade e carrega o GESTO decidido em
`agentMapping.computeAgentMeta` (−1 = idle próprio → estado 3; ≥0 = índice
GLOBAL do clipe → estado 4), sorteio ponderado estável por slot
(mulberry32) com candidatos idle/rezar/regras `elemento → clipe (peso)` —
regras novas nunca mais tocam a GPU. **Playback × por estado sem buffer
novo**: o clock global anda a `fps` frames/s; somar `(mult−1)×fps×dt` na
FASE por agente (state pass) faz o frame efetivo andar a `mult×fps` — o
sampler não muda, o orçamento de 4 varyings do TF fica intacto.

**Hover (M4c; picking re-feito 2026-07-13)** — a v1 escolhia a pessoa mais
próxima em XZ do ponto do raycast NO CHÃO (raio 1,2 m): com o cursor sobre
o tronco/cabeça o ray atravessa o corpo e aterrissa metros ATRÁS do
personagem (da câmera default a cabeça projeta ~3,8 m de chão) — "não pega"
(bug M4c). O picking agora é em **SCREEN-SPACE**: o torso de cada pessoa
(`getPosSmooth`) é projetado para pixels e o acerto é uma elipse do tamanho
APARENTE do corpo (half 0,55×1,05 m × escala, ÷ profundidade; piso 18×26 px
para gente longe; teto de distância 75 m; quase-empate → o mais perto da
câmera vence — quem oclui é quem se vê). Tronco E cabeça acertam; pixel
vazio não hovera ninguém. Rótulo lê a MESMA posição suavizada — não treme.
Sonda: `scripts/follow-probe.mjs` move o mouse REAL ao pixel projetado
(`__limiarPersonScreen(i, frac)`) e confere `hoverStore`.

**Follow (M4d; rig re-arquitetado 2026-07-13 — fix do snap e do jitter)** —
a v1 tinha fases (transição smootherstep de 1,2 s → lock por delta) e DUAS
falhas de sensação: (1) durante a transição `controls.enabled=false` faz o
drei PULAR `controls.update()` e nada girava o quaternion — a posição
viajava com o olhar CONGELADO e o primeiro `update()` do lock aplicava o
lookAt acumulado (~8–23° medidos) num frame só: o "snap" do relato era
ROTAÇÃO, não posição; (2) o lock copiava o delta CRU do espelho (rajadas do
readback + empurrões da separação) direto na câmera. O rig novo é **SEM
fases**: âncora do olhar, offset câmera−âncora e posição suavizada da
pessoa são **springs criticamente amortecidas** (SmoothDamp, dt-estável)
re-alvejadas por frame — a "transição" é a spring convergindo, o lock É a
spring convergida, e `camera.lookAt(anchor)` acontece TODO frame junto da
posição: não existe costura para dar snap, por construção. OrbitControls
fica LIGADO o tempo todo: depois do `update()` do drei (prio −1), qualquer
diferença entre o offset real e o que o rig escreveu no frame anterior é
input REAL do usuário (órbita/zoom + cauda do damping) e re-alveja a spring
do offset; pan desliga no follow (brigaria com a âncora). Retarget
pessoa→pessoa reusa as MESMAS springs a partir da pose corrente (P0 real,
velocidades preservadas — A→B contínuo); resíduo de damping de um arrasto
anterior é DESCARTADO no clique/troca (flush com `dampingFactor=1 +
update()` zera os deltas internos e a pose é restaurada — clique é intenção
nova; aplicá-lo dava spike de ~4° no pessoa→pessoa pós-órbita, e deixá-lo
vivo contaria como "input" por ~1,5 s e cancelaria a viagem). ESC/clique no
vazio solta sem teleporte. Sliders `follow smoothing (s)` (spring da
pessoa, default 0,35 s) e `follow ease (s)` (viagem, default 0,45 s) no
grupo Scene via pref() + `?followSmooth=`/`?followEase=`. Clique ≠ arrasto:
down→up com <6 px e <400 ms. `?follow=<i>` headless.
**Sondas** (rodam nos 2 backends): `scripts/follow-probe.mjs` —
`__limiarCamTrace` (dev) grava |Δpos|, Δângulo e Δt por frame em priority
0.5 (pós-rig, pré-render; deltas normalizados pelo Δt real — hitch de
headless não é snap); anti-snap = nenhum frame >3× os vizinhos (antes:
12,6–23° no handoff; depois: rampa suave), lock 5 s com desvio ~1–3 mm e 0%
de frames congelados (antes: 30% congelados no WebGPU denso — a escada do
readback), órbita DURANTE o follow gira o enquadre sem soltar, ESC sem
teleporte; fluxo real via gancho `__limiarFollow(i)` — `?follow=` não passa
pela pose de overview. `scripts/follow-settled-check.mjs` — meta de
qualidade do relato: seguindo pessoa ASSENTADA (estado 3/4 via readback de
states) em grid 32 denso com separação 3,5, o tremor de alta frequência da
câmera (>~4 Hz, resíduo sobre média móvel ±5 frames re-amostrados a 60 Hz)
tem de ficar p95 <2 mm/frame e sem vaivém — medido **0,85 mm (WebGPU) /
0,09 mm (WebGL2)**, 0% reversões; deriva lenta (a multidão espreme, físico)
passa por design.

**Terreno vivo (M4f)** — `src/scene/heightfield.ts` implementa h(x,z) DUAS
vezes com a MESMA matemática: TSL (chão + sim) e JS (marker, labels).
Paridade por construção: hash PCG INTEIRO (o mesmo do `hash()` do three;
nada de `fract(sin(...))`, que quebra em float32/WebGL2), lattice→seed em
aritmética uint32 dos dois lados (`Math.imul`/`>>>` ≡ wrap da GPU),
value-noise bilinear com fade quíntico, fbm ≤5 oitavas com gate fracionário,
domain warp e **flatten radial no centro** (anfiteatro dos núcleos, doc 04
§1.1). Sonda de paridade mediu erro máx ~2e-6 (float32) nos 2 backends.
Os uniforms são compartilhados em module-level: o MESMO nó alimenta o
material do chão e os passes da sim (`y = h(x,z)` no reset e no update —
forças seguem em XZ; fios/render/espelho herdam o y). O chão virou UM mesh
(RingGeometry 0→80, subdividida nas duas direções — CircleGeometry só
divide o perímetro) com `MeshStandardNodeMaterial`: `positionNode` desloca
y, normal por diferenças finitas no vertex (varying), e o GRID é TSL no
próprio material (fract/fwidth anti-aliased, célula 0,25/extensão 42,5 do
gridHelper antigo, cores do Appearance) — abraça o relevo em vez de boiar.
Raycast do mouse continua na malha CPU flat; o y real vem do `heightJS`
(marker/labels). FPS 60→60 nos dois backends com terreno ligado. Grupo
"Terrain" no leva com presets (só mudam params); `?terrain=<preset>`,
`?terrainAmp=`, `?terrainOn=`. Amplitude default 0 = paridade visual total.

### 14.7 Campo do ativo, formações e o palco/esteira (2026-07-14)

As 3 mecânicas de multidão do doc 04 §5.9/§5.10 — fatos técnicos:

**Campo de repulsão por UNIFORM vs separação assimétrica** — dois
mecanismos deliberadamente diferentes para "ativos abrem espaço":

- **Pessoa seguida** (1 ativo): força radial suave (smoothstep até o
  raio, empurra só XZ) por **uniforms** (`fieldPos/Radius/Strength/
  Agent`) alimentados por frame do positionMirror no CrowdMesh. Uniform =
  zero custo de buffer e **funciona idêntico no WebGL2/TF** (nenhum
  storage novo no pass — o orçamento de 3 varyings do update fica
  intacto). O próprio agente é excluído por índice (`fieldAgent`).
- **Migrantes** (N ativos): impossível por uniform (N posições) — entra
  no loop de separação O(N²) que JÁ lê os vizinhos: peso assimétrico
  `1 + (yieldWeight−1)×(1−temAlvo(self))×temAlvo(j)×seekGate` lendo
  `targets[j].w`. Só WebGPU (o fallback não tem separação desde o M2).
  **Armadilha de custo pega na medição:** a parte invariante do peso
  (`yieldGain`, que lê `targets[self]`) TEM de sair do loop via
  `toVar()` — inlinada, o TSL re-avalia a expressão inteira em CADA
  iteração: 40→23 fps em 4096 agentes; com toVar, 40→39-42 (≈grátis).

**Formações = padrões de ALVOS, não força nova** — `computeDormantTargets`
(`agentMapping.ts`) escreve os slots dormentes (≥ people.length até o
grid visível) na MESMA infra de targets do M3; a state machine existente
assenta quem chega (idle/rezar). `circle`/`clear` = anéis estáveis
(jitter mulberry32 por slot); `corridor` = 3 camadas por lado ao longo do
rumo da pessoa seguida. Formação ativa força o seek como as lentes (sem
gravidade ligada não haveria efeito). **Aprendizados de sonda:**
(a) heading por EMA de deltas por frame GIRA com o jitter de
readback/separação da pessoa assentada — o rumo vem de uma **trilha**
(1 amostra/250 ms, janela 2 s) e só conta com deslocamento real ≥1,2 m;
(b) alvo que persegue a pessoa por frame vira turba — o corredor é
**ancorado no mundo** e re-ancora só quando ela atravessa ~35% do
comprimento, sai pela lateral ou vira o rumo (checado a cada 0,8 s);
(c) anel a 0,92×contenção briga pouco com a força de contenção (equilíbrio
~1 m aquém do alvo, dentro do settleR — assentam; medido dist média
0,84 m, 100% assentados/rezando após 60 s).

**Palco/esteira (experimental)** — a ilusão de viagem sem deslocar a
pessoa, 3 peças sincronizadas pela MESMA velocidade (`stageSpeed`):

1. **Pino**: teto de velocidade ×0,001 no agente seguido (update pass) +
   **walking forçado no state pass** (deixar a state machine ver v≈0
   levaria a idle e quebraria a ilusão) com a fase avançando
   `stageSpeed×phasePerUnit` — o passo casa com o chão que anda (nada
   patina). Heading do pino gira suave ao rumo do palco.
2. **Scroll do heightfield**: uniforms `scrollX/scrollZ` deslocam o
   DOMÍNIO do noise (warp+fbm) e as linhas do grid TSL — o flatten
   (anfiteatro) fica ancorado no mundo. **Paridade TSL+JS obrigatória**:
   `setTerrainScroll()` escreve GPU e espelho JS juntos; sim, chão, fios
   e marker leem a mesma altura deslocada. O scroll acumula
   (`heading×speed×dt` com o MESMO clamp de dt da sim) e não zera ao
   sair — o mundo "fica onde a viagem chegou", sem salto.
3. **Wrap modular dos dormentes**: na janela local do palco (caixa
   orientada pelo rumo, `stageHalfLen/Wid`), dormente recua por
   **deslocamento direto de posição** (não velocidade — a state machine
   os vê parados: em pé, deslizando com o chão) e ao cruzar a borda de
   trás soma `2×halfLen` no eixo do rumo (1 teste basta: passo/frame ≪
   janela). Alvos/wander suspensos na janela (`stageCarry` gateia
   seekGate e wanderMul); separação/contenção seguem vivas.

Exige follow + estados automáticos (per-agent); heading congelado na
entrada do modo (a pessoa pinada não gera mais rumo). Sondas novas:
`scripts/field-probe.mjs` (vizinhos no raio com/sem campo),
`scripts/formation-probe.mjs` (churn de alvos + convergência + estados),
`scripts/stage-probe.mjs` (Δscroll em 3 s ≈ speed×3, pino ~0 m,
stateId=1). Medidos: scroll Δ3,08 m/3 s @ speed 0,9 (o extra é o clamp de
dt), pino desloca 0,003-0,005 m/3 s, walking forçado OK nos 2 backends.
Artefatos ACEITOS na fundação (doc 04 §5.10): pop no wrap se a borda de
trás está em quadro; corredor + campo ligados ao mesmo tempo curvam as
sebes (raio do campo > meia-largura do corredor); durante o pre-roll do
`?simT` o palco fica off (espelho ainda não leu — engata ao vivo).

**Plano registrado (M6):** o *bend* cilíndrico do chão (plano→cilindro
envolvendo a câmera, túnel de luz em alta velocidade) é evolução do
heightfield — mesma h(x,z), re-mapeada em coordenadas cilíndricas no
positionNode do chão + curvatura no update pass da sim; o wrap modular
dos dormentes generaliza para instâncias de cenário (objetos em loop por
módulo+offset). Ver doc 04 §5.10.

### 14.8 A voz — pipeline Opus→Supabase e o player da timeline (Voz v1, 2026-07-14)

O áudio saiu do "pendente desde o M3" e entrou no ar. Doc 04 §4.2 item 4
tem o UX; aqui, os fatos técnicos e o ritual de operação.

**Mapeamento JSON→arquivo (fonte da verdade, verificado nas 86 pessoas):**
em `people/<id>.json`, o bloco `audio` referencia os cortes de
`acervo/export/audio/<id>/`:

- `audio.beats[i].file` alinha **1:1 por posição** com `beats[i]`
  (0 descasamentos em 86; nome = `beat_{beat_index:03d}_{type}.mp3` — o
  índice do NOME é o `beat_index`, que pula números quando um beat não
  ganhou corte);
- `audio.quotes[key][j]` alinha por posição com `elements[key].quotes[j]`
  (4181 arquivos, 0 descasamentos; nome = `q_{key}_{j}.mp3`). Atenção:
  68 elementos têm quotes fora de ordem de `t_norm` — quem ordena para
  desenhar (timeline) precisa guardar o índice ORIGINAL para resolver o
  arquivo;
- `audio.whisper` = `whisper.mp3` (reservado para a Sintonia §5.1).
- O disco pode ter ÓRFÃOS de exports antigos (9 beats de silvana-pires no
  lote 4) — por isso o sync varre os JSONs, nunca o `ls`.

**Compressão** (`scripts/audio-sync.mjs`): mp3 96 kbps mono → **Opus mono
32 kbps VBR `-application audio`** (~34% do tamanho; 4,65 GB → 1,58 GB nos
6.644 cortes). Escolha medida em 4 cortes de fala (asdr vs original):
32k audio-mode SDR 16,2–18,3 dB · 24k audio-mode 14,9–16,2 dB · os modos
`voip` pontuam MUITO pior neste material já comprimido (7–11 dB) — e como
a org está no plano Pro (100 GB), os ~0,4 GB extras do 32k não custam
nada. Staging fora do repo (`/tmp/limiar-opus` — em `~/Documents` o
iCloud evictaria milhares de arquivos pequenos), escrita atômica
(tmp+rename), ~6 workers ffmpeg = ~25 min o corpus inteiro.

**Hospedagem**: bucket público `audio-cortes` no projeto Supabase NDE
(`knqseuknuihqwlkfgesi`, org no plano Pro). Leitura pública pelo endpoint
`/storage/v1/object/public/audio-cortes/<pessoa>/<corte>.opus` (bucket
`public=true` + policy `voz anon read audio-cortes`). **Escrita fica
FECHADA**: o upload usa a anon key com policies TEMPORÁRIAS
(`voz TEMP anon insert/update audio-cortes` em `storage.objects`), abertas
via MCP/SQL antes do sync e DERRUBADAS ao final — ritual de re-sync após
um lote novo do acervo:

1. `create policy "voz TEMP anon insert audio-cortes" on storage.objects
   for insert to anon with check (bucket_id = 'audio-cortes');` (+ a
   gêmea de update) — via MCP `execute_sql`;
2. `node scripts/audio-sync.mjs --upload` (idempotente: comprime só o que
   falta no staging, sobe só o que falta no bucket, regenera o
   `_index.json` global no root do bucket);
3. `drop policy` das duas TEMP (a de leitura fica). Validar com
   `curl -I` num corte (200 + content-type audio/ogg).

**Player no app** (`src/audio/`): `player.ts` = um `Audio()` singleton com
fades de ~120 ms por rampa de volume em rAF (sem WebAudio) e guarda de
token ("a última chamada vence" — cliques rápidos nunca sobrepõem vozes);
`cuts.ts` = resolução de URL (base: `?audio=` > `VITE_AUDIO_BASE` >
bucket; ver README do app) + disponibilidade via `_index.json` (1 fetch;
ponto sem corte = "sem áudio ainda", sem 404) + zustand do que toca.
Anel de progresso e pulso são atualizados IMPERATIVAMENTE no rAF da onda
da timeline (zero re-render por frame — padrão da atração ao mouse).
Opus/Ogg toca em Chrome/Edge/Firefox; Safari só ≥ 17.4 — aceito no
protótipo. Sonda: `scripts/voz-probe.mjs` (clique real no SVG headless
com `--autoplay-policy=no-user-gesture-required`, valida URL contra o
mapeamento, t avançando, troca/para/ESC, screenshots `shots/voz-*.png`).
Gancho dev p/ o próximo marco: `window.__limiarAudioBeat` = {personId,
beatIndex, file, url, t, duration, progress} enquanto toca.

### 14.9 Mundo-toro, esteira universal, leme e story field (2026-07-14b)

O adendo do Dudu virou **um sistema só**: o follow padrão pina a pessoa e
move o mundo; o mundo é um toro; o mouse é o leme. Fatos técnicos:

**Wrap universal (mundo-toro).** Um período `L` compartilhado
(`terrainU.wrapLen`, uniform lido pela sim E pelo heightfield;
`setWorldWrap(L)` escreve GPU+JS) define a área canônica `[−L/2, L/2)²`
(L = 2× contenção). No update pass (os **dois** backends — é aritmética
local, sem vizinhos) a posição final passa por `wrapDeltaTSL` por eixo
(`d − L·floor(d/L + 0,5)`); com wrap ON a **contenção radial desliga**.
`wrapDeltaTSL` degenera em identidade com L=0 → aplica-se sempre, sem
branch. **Deltas toroidais**: seek, mouse e campo do ativo usam
`wrap2(delta)` — quem wrappa perto da borda busca o alvo/foge do campo
pelo **menor caminho no toro**, nunca atravessa o mapa de volta.
**Limitação documentada:** separação/vizinhança NÃO é toroidal (o loop
O(N²) lê posições cruas — na costura, vizinhos do outro lado não empurram;
invisível na prática). Sonda `coh-probe.mjs`: 45+ eventos de wrap, todos
dentro de ½L, salto wrappado ~0,06 m (≈ passo normal) e estado preservado
(taxa de troca no wrap = taxa base da state machine — o wrap só mexe em
posição).

**Tiling do noise (heightfield, paridade TSL+JS obrigatória).** Com wrap
ON cada escala do value-noise é **tileada** no período L:
`P = floor(L·freq + 0,5)` células por volta, frequência quantizada `P/L`
para P inteiro; o wrap acontece no **índice da lattice** (cada canto por
`wrapIdx = i − P·floor(i/P)`), então `h(x+L) = h(x)` EXATO na costura. O
flatten (anfiteatro) passa a viver no domínio scrollado+wrappado (viaja com
o mundo e repete por tile). `floor(v+0,5)`, nunca `round()` — half é
implementation-defined na GPU; paridade primeiro. Com amplitude 0 (default)
o custo existe mas o resultado é 0 (o `select` da GPU avalia os dois ramos).

**Esteira universal (o follow padrão, kill-switch `stage`).** O pino
(velocidade→0 + walking forçado enquanto a esteira anda; no deadzone do
leme volta a idle, honesto) é o mesmo do M6; o que mudou: **todos os
outros agentes** recuam `stageSpeed×dt` contra o `stageHeading` por
deslocamento direto de posição no update pass (`(1−isPinned)`), e o
`setTerrainScroll` avança no MESMO passo (u.dt = dtc, mesma velocidade →
agentes e relevo em lockstep, sem deriva). Os alvos vivem no **ground
frame**: o seek e a coesão dos fios subtraem o scroll (`tgt − scroll`)
antes do delta toroidal — formações inteiras são carregadas e wrappam como
todos. A janela local do palco (stageHalfLen/Wid) saiu — é o mundo inteiro
agora.

**Inércia do selecionado (fix do stutter).** `selInertia` (0–1, default
0,15) escala a separação (WebGPU) E a contenção (dois backends)
**recebidas** pelo agente seguido (`mix(1, selInertia, isSel)`) — os
inativos cedem por inteiro, ele quase não desvia. `selAgent` é uniform
separado do `fieldAgent` (a inércia vale com o campo on OU off). Sonda:
seguido assentado em multidão densa (sep 3,5), com campo+inércia vs sem —
reversões laterais e RMS do jitter caem (medido 8,0→4,0 mm, 3→1 reversões
num run; WebGL2 sem separação só relata — a inércia da separação é inerte,
só campo/contenção agem).

**Leme (steering).** CPU amostra por frame via `computeSteerSample` (`steer
pivot`): modo **pessoa** usa `mouse − posição da pessoa` no chão; modo
**screen** usa offset isotrópico do centro da tela (convertido para metros na
profundidade da pessoa) — o raycast no chão continua como alvo visual. Fora
da deadzone (~1,5 m) gira o `stageHeading` (suavizado por `steer strength`)
e escala `stageSpeed` pela distância (`steer speed ramp`); dentro da
deadzone `stageSpeed→0` (rampa suave). No kill-switch (treadmill OFF) o leme
vira força direta (`steerDir` + `steerSpeedMul`) que sobrepõe wander/gravidade
só do seguido. Debug: `steer wheel debug`; sonda `__limiarSteerWheel`. Sonda:
o rumo responde ao ponteiro (dot cai), o mundo scrolla ~2 m em 2,5 s,
apontar no lado oposto inverte o rumo e apontar na pessoa para a viagem.

**Story field (modo livre).** No loop de separação (WebGPU), além do
`targets[j].w` do yield, lê-se `agentMeta[j].x` (flag com-história) do
vizinho — o gate do self sai via `toVar()` (lição do yieldGain: inlinar
re-avalia por iteração) e o fetch só ocorre no branch (dormente, modo on,
dist < raio). Força radial atrai (`−story`) ou repele (`+story`) SÓ os
dormentes, vinda dos com-história no `story field radius`; capped e fraca
(alvos vencem). Uniform `storyMode` (−1/0/+1). Custo do fetch extra:
dentro do ruído a 4096 (medido story off≈on). WebGL2: sem separação, sem
story field.

**FollowCamera (mudança mínima, sonda re-rodada).** Se a pessoa seguida
wrappa (só no modo legado sem pino — no padrão ela é pinada e nunca cruza
a borda), o rig inteiro (câmera+âncora+pessoa suavizada+target) desloca
pelo mesmo múltiplo de L num frame — atravessa a costura sem chicote. Não
age no retarget (a troca A→B viaja pela spring). `follow-probe` verde nos
2 backends (lock ≤1,8 mm, sem snap, ESC limpo).

**Debug areas (`?debugAreas=1`, `src/render/DebugAreas.tsx`).** Overlays
Line/LineLoop→**Line** (o WebGPU do three NÃO suporta LineLoop — erro por
frame derrubava a 2 fps; medido): quadrado da área canônica (segue o
grid/relevo), círculo de contenção (só wrap OFF), anéis dos núcleos (raio
de formação nos centroides UMAP×mapScale, no ground frame — fluem e
wrappam), círculo do campo do ativo e seta do rumo da viagem. <20 objetos,
posições por frame (barato). É a área canônica mostrada como o palco de
tudo.

### 14.10 Hierarquia visual e exploração dos núcleos (2026-07-14)

A camada de leitura/exploração dos núcleos (doc 04 §5.11/§5.12). Montada em
`App.tsx` DENTRO do Canvas (NÃO no `CrowdMesh` — território da Multidão em
edição paralela); os componentes leem a sim viva via `positionMirror.simRef`
(o hover/follow já registram a `CrowdSim` lá) e os parâmetros do CrowdMesh
via `levaStore` (`src/lib/levaRead.ts`, leitura imperativa, nunca escreve).

**Anti-colisão dos rótulos em screen-space (`ClusterLabels.tsx`).** Por
frame projeta-se o centro de cada núcleo (≤13) para pixels; a meia-extensão
do quad billboard vira px por `m/mpp` (`mpp = 2·tan(fov/2)·depth/altura`).
Relaxação em ≤4 passadas por PRIORIDADE (nº de membros desc): o maior fica,
o menor sobe até limpar o AABB do maior (`desiredJy = iy − halfH_i −
halfH_j − margem`). O offset é em PIXELS, animado por spring (τ 0,18 s) e
convertido em deslocamento no mundo pelo vetor UP da câmera
(`worldUp = −offsetPx·mpp`) — sobe na tela em qualquer ângulo. Fade extra
por aglomeração (offset grande = câmera longe demais → some até ~45%).
Escala do rótulo decresce com a distância (clamp `MIN_SCALE_MUL` 0,62) para
hierarquia de leitura. Verificado headless: câmera baixa, 13 núcleos
vizinhos, **7 pares sobrepostos → 0** com a feature ligada (2 backends).

**Rótulo clicável → FOCUS (`scene/ClusterFocus.tsx` + `scene/focusStore.ts`).**
Picking em screen-space (mesma projeção da anti-colisão; cursor pointer em
`useFrame` priority 2 — roda DEPOIS do PersonHover, que reseta o cursor no
priority 0, sem briga). Clique curto (não-arrasto) num rótulo → `focusCluster`;
clique no vazio → `clearFocus`. O rig de foco é PRÓPRIO e simples (não usa
nem edita o FollowCamera): captura pose atual, alvo = centroide VIVO dos
membros (positionMirror; fallback centroide UMAP×mapScale), distância =
`clamp(raio·2,3 + 3,2, 5, 42)`, preservando o azimute; voa em ~1,4 s com
smootherstep. Durante o voo `controls.enabled=false` (o drei só chama
`update()` com enabled) e a pose é escrita à mão; ao pousar religa e
`controls.update()` sincroniza — sem costura. **Bloqueado se
`followStore.following ≠ null`** (a câmera tem dono); follow ativo cancela o
foco. Sair NÃO teleporta (só solta).

**Destaque persistente + sublente por interseção (`legendStore` +
`crowd/colorEmphasis.ts`).** `triggerLegendFlash(flash, Infinity)` — hold
INDEFINIDO (sem timer; `legendFlashK` devolve 1 enquanto `holdMs` não é
finito); `clearLegendFlash()` re-baseia para "hold acabou" e percorre o fade
normal. Novo `kind: "clusterElement"` (id `"<clusterId>:<elementKey>"`) no
colorEmphasis: só quem é do núcleo E tem o elemento mantém a cor; o resto
(inclusive o resto do núcleo) colapsa no cinza. Reusa 100% o mecanismo de
flash existente do CrowdMesh (zero edição nele).

**Assinatura por LIFT (`data/clusterSignature.ts`).** Para cada elemento:
`lift = (% de membros do núcleo com o elemento) ÷ (% do corpus com o
elemento)`. Ordena por lift desc com piso de suporte (≥2 membros, ou ≥40%
em núcleos ≤4) — assim "inefabilidade/missão" (quase universais) não
encabeçam todos os núcleos; sobem os que DISTINGUEM (ex.: "Os jardins de
luz" → estado_de_graca 2,3×). Top-6 viram CHIPS clicáveis no painel de foco
(`ui/FocusPanel.tsx`, irmão da Legend). Tudo client-side sobre
`manifest.people`.

**Contorno circular dos núcleos (`render/ClusterOutlines.tsx`).** Para cada
núcleo FORMADO (sinal COMPARTILHADO — ver abaixo) um anel no chão: raio =
membro mais distante do centroide vivo + folga (`PAD_MUL`/`PAD_ADD`), lerp
temporal (amostra ~0,3 s) + leve respiração. 48 segmentos em `THREE.Line`
com fecho explícito (o WebGPU do three **não suporta LineLoop** — mesma lição
do §14.9), material dessaturado, `depthWrite:false`, y = `heightJS(x,z) +
0,02`. ~13×49 ≈ 650 vértices reescritos/frame na CPU (posições do
positionMirror — sem readback novo): desprezível.

**Sinal de formação compartilhado (`data/clusterFormation.ts`).** A detecção
saiu do ClusterLabels (que tinha readback GPU próprio) para um módulo que lê
o **positionMirror** (espelho CPU contínuo que hover/follow já mantêm) —
`tickClusterFormation` é idempotente (relógio de 0,6 s; labels E outlines
chamam, só o 1º faz trabalho). Mesma regra de antes (média das distâncias
dos membros aos alvos UMAP < formRadius, histerese 1,35×; fallback por tempo
se o espelho quebrar). **Um readback a MENOS** que antes.

**LOD "vista de dados" (`render/DataViewDiscs.tsx`).** InstancedMesh próprio
(1 draw call, `MeshBasicNodeMaterial`): `positionNode` lê `sim.positions`
como **storage read-only + `setPBO(true)`** (padrão dos fios — zero tráfego
CPU↔GPU), coloca um quad no plano XZ (via `uv−0,5`, raio = escala por pessoa
× slider) em `iPos.xz`, y = `iPos.y + 0,04`; `opacityNode` = círculo suave
(`oneMinus(smoothstep(0,82, 1, dist_uv))`) × crossfade × alpha. Crossfade
por ALTURA da câmera (`smoothstep(H−banda, H, camY)`, slider default 55).
**Cor dos discos (dívida documentada):** o `iColorScale` da multidão é
atributo do CrowdMesh (não editável aqui), então reconstrói-se a cor com as
MESMAS funções puras (`fillContentAttributes` de `crowd/spawn.ts`, seed lida
do levaStore) no próprio atributo — determinístico; v1 não reflete HSB/lente/
destaque do CrowdMesh. A multidão real NÃO some (fade do mesh dela exigiria
tocar seu material — ticket para a Multidão); os discos entram POR CIMA (de
longe a multidão já é minúscula).

**Grupo leva "Focus & reading" (`ui/FocusControls.tsx` + `focusReadingStore`).**
Arquivo próprio (montado em App.tsx como o AppearanceControls) para não tocar
CrowdMesh: anti-overlap on/off, label distance falloff, cluster outlines +
alpha, data view (birdseye) + height + fade band + disc size. Tudo
pref()-wrapped (persiste pelo grupo Preferences; query params vencem —
`?labelAnti=`, `?outlines=`, `?outlineAlpha=`, `?dataView=`, `?dataViewH=`,
`?discSize=`…).

**Custo (medido headless, 2 backends).** A camada é ~grátis: 4096 agentes
WebGL2 **57,7 fps (camada OFF) vs 57,8 fps (ON)**; birdseye com discos
ativos 60 fps. Rótulos+contornos não movem o ponteiro; os discos são 1 draw
call sobre o mesmo storage. `scripts/hier-shots.mjs` (4 cenários × 2
backends) e `scripts/hier-fps.mjs`. follow/prefs/states-probe seguem verdes.

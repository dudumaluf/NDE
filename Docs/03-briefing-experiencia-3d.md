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

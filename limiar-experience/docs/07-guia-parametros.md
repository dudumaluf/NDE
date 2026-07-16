# 07 — Guia dos parâmetros (o resto do painel, explicado)

> **Papel deste documento:** manual de uso dos controles do painel de debug
> (leva) que **ainda não tinham manual** (pedido do Dudu, 2026-07-14: "escreve
> uma documentação para coisas que não documentamos ainda dos nossos
> parâmetros"). É o irmão do doc 06 — que já explica **Vocabulary** (as
> animações). Aqui está **todo o resto**: Scene, **Field · physics**,
> **Witnesses**, **Dormants**, **Field · coupling**, **Stage (treadmill)**,
> Focus & reading, Appearance, Terrain, Effects e Preferences.
>
> **Reorganização 2026-07-15:** Crowd + Simulation viraram **Field · physics**
> (física da multidão). Estados de chegada + Data (M3) + lente demográfica
> viraram **Witnesses** (testemunhas com história). Formations + pausas/×
> dormentes viraram **Dormants**. Active field (campo/repulsão/story field)
> virou **Field · coupling**; o leme (`mouse steering`) foi para **Stage**.
> Presets antigos migram sozinhos (`prefs.ts`). Estados automáticos: doc 06.
>
> O design por trás mora no doc 04 (experiência/consumo); a técnica no doc 03.
> Os nomes citados são os do painel (inglês desde 2026-07-13; ver doc 06 §6).
> As animações **não** estão aqui — vá ao **doc 06**.

---

## 0. Antes de tudo: três regras que valem para o painel inteiro

1. **Persistência.** Qualquer valor que você mexer vira padrão permanente se
   clicar **Preferences → save as default** (grava tudo no navegador). Sem
   isso, um reload volta à fábrica. Ver §12.
2. **A URL vence o salvo.** Todo parâmetro com "qp `chave`" nas tabelas abaixo
   pode ir na URL (ex.: `?grid=48&gravity=1`) — e o que está na URL ganha do
   salvo e da fábrica. É como os screenshots headless ficam reproduzíveis.
3. **Backend importa.** No **WebGPU** (padrão) tudo funciona. No fallback
   **WebGL2** (`?forceWebGL=1`, ou máquina sem WebGPU) **não existe separação
   entre agentes** desde o M2 — então tudo que depende dela (`separation`,
   `yield to travelers`, a parte de separação do `selected inertia`, o
   `story field`) fica inerte. O resto (contenção, wrap, gravidade, steering,
   câmera, efeitos) vale nos dois.

> Grupos com "(só com acervo)" só fazem efeito quando o `data/` está carregado
> (as 116 pessoas reais). Sem acervo, a cena é multidão genérica e esses
> controles ficam ociosos.

Ordem dos grupos no painel (todos começam recolhidos, menos Effects):
Scene · **Field · physics** · **Dormants** · Vocabulary · **Witnesses** ·
**Field · coupling** · **Stage (treadmill)** · Focus & reading · Terrain ·
Effects · Appearance · Preferences.

---

## 1. Scene — o modo e a câmera de follow

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `mode` | crowd | `scene` | **crowd** = a multidão (a experiência). **character** = um personagem só, para conferir morph de clipes (demo M0.5) |
| `follow smoothing (s)` | 0.35 | `followSmooth` | Constante de tempo da mola sobre a POSIÇÃO da pessoa seguida. **Subir** absorve mais o tranco da colisão na multidão densa (steadicam); **descer** cola mais na pessoa |
| `follow ease (s)` | 0.45 | `followEase` | Constante de tempo da VIAGEM da câmera (ao entrar no follow ou trocar de pessoa). Maior = chegada mais lenta e cinematográfica |

> **Como se segue alguém:** passe o mouse sobre uma pessoa (nome aparece em
> 3D) e **clique** — a câmera viaja suave até a 3ª pessoa; a **história
> começa** sozinha (~0,75 s de overview da timeline, depois zoom suave no 1º
> capítulo + áudio). Clicar em outra pessoa re-alveja a MESMA câmera
> (transição contínua A→B); **ESC** ou clique no vazio solta. Clique ≠ arrasto
> (arrastar é órbita). No boot, `?follow=6` já entra seguindo a pessoa 6
> (screenshots). Técnica do rig: doc 03 §14.6.

---

## 2. Field · physics — população e movimento

Fusão de Crowd + Simulation (2026-07-15). A grade, o spawn e as forças que
movem **todos** os agentes — testemunhas e dormentes. (Limiares de animação
`v0`/`v1` moram em **Witnesses**; ver doc 06.)

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `grid (N×N)` | 32 | `grid` | Lado da grade: **N² agentes**. O espaçamento segue o raio de contenção (disco = 2×) |
| `spawn noise` | 0.6 | — | Bagunça do nascimento (0 = grade perfeita; alto = nuvem orgânica) |
| `seed` | 3 | — | Semente do sorteio de posição/atributos. Muda o arranjo sem mudar a lógica |
| `person scale` | 2.5 | — | Tamanho dos corpos |
| `palette (vs. dormant)` | on | — | on = paleta de núcleos nas cores; off = todo mundo na cor de dormente |
| `hide (draw only witnesses)` | off | `onlyPeople` | Esconde os dormentes: desenha só as pessoas reais do manifest. A sim continua rodando para todos (fios/rótulos seguem válidos) — é corte de DESENHO |
| `reset` | (botão) | — | Respawna a multidão do zero com os valores atuais |

> **Dormentes** = os slots além das pessoas reais (ex.: 1024 agentes − 116
> pessoas = 908 dormentes). Formação, pausas e multiplicadores deles moram em
> **Dormants** (§5); cor de dormente em Appearance (§10).

**Forças e debug** (ex-Simulation — mesma tabela, agora neste grupo):

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `max speed` | 0.8 | `speed2` | Teto de velocidade de todo mundo — multiplique por `speed ×` em **Witnesses** / **Dormants** |
| `separation (weight)` | 1.6 | — | Força que empurra vizinhos para longe (evita sobreposição). **WebGPU only** |
| `separation radius` | 0.7 | — | Até que distância a separação age |
| `containment radius` | 21 | `contain` | Raio do disco de jogo: spawn, grid no chão e curral seguem este valor (wrap = quadrado 2×) |
| `world wrap` | on | `wrap` | Toro: quem cruza a borda reaparece do outro lado |
| `toroidal separation` | on | `wrapSep` | Com wrap: vizinhos na costura se empurram (menor caminho no toro) |
| `wrap seam margin (m)` | 0.8 | `wrapHyst` | Metros além de L/2 antes do teleporte — mata flicker no limiar |
| `debug areas` | off | `debugAreas` | Overlays de arame: quadrado do wrap, círculo de contenção, anéis dos núcleos, círculo do campo do ativo e a seta do rumo. **A melhor forma de ENTENDER o mundo-toro** |
| `mouse` | attract | `mouse` | Ponteiro no chão em modo livre: **attract** puxa, **repel** afasta, **off** nada. (No follow o mouse vira leme — §5) |
| `mouse radius` | 7 | `mouseR` | Alcance da força do mouse |
| `mouse force` | 1.2 | — | Intensidade da força do mouse |
| `turn smoothing` | 6 | — | Quão rápido os corpos giram para o rumo novo (baixo = viradas largas) |
| `stride/unit` | 34 | — | Frames de passo por unidade andada (calibra o "não patinar" dos pés). Muda a cadência visual, não o estado |
| `flip facing` | off | `faceflip` | Inverte a frente do modelo (se a VAT vier virada) |
| `pivot X` / `pivot Z` | 0 | `pivotX` / `pivotZ` | Desloca o **eixo de rotação** em unidades do bake (× person scale no mundo). Persistem em `Field · physics.pivotX` / `pivotZ` (Preferences → save as default) |
| `debug color` | off | `debug` | Pinta cada agente por um dado: **speed / direction / target / state**. `state` é a régua de calibração das animações (doc 06) |

---

## 3. Witnesses — testemunhas com história (só com acervo)

Fusão de States (per agent, sem dormentes) + Data (M3) + lente demográfica
(2026-07-15). É aqui que os **dados reais organizam quem tem história**:
estados de chegada, gravidade UMAP, lentes, fios e rótulos.

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `automatic states` | on | `estados` | Máquina de estados por agente (idle/walk/run/settle). Ver doc 06 |
| `v0 idle⇄walk` | 0.12 | `v0` | Limiar de velocidade idle↔walk |
| `v1 walk⇄run` | 1.15 | `v1` | Limiar walk↔run |
| `hysteresis (±)` | 0.12 | — | Faixa morta entre limiares |
| `crossfade (s)` | 0.3 | — | Duração do blend entre clipes |
| `settle: idle weight` | 1 | — | Peso do idle no assentar |
| `settle: pray weight` | 0.6 | — | Peso do rezar no assentar |
| `arrival wave` | 0.9 | `onda` | Onda de chegada nos núcleos (só testemunhas com seek ativo) |
| `wander while seeking` | 0.35 | — | Curl en route ao UMAP/lente: 0 = marcha direta, 1 = vento cheio |
| `lock at cluster` | on | `clusterLock` | Perto do slot, curl desliga — assentam no núcleo |
| `wander weight` | 1 | — | Força do curl (só testemunhas) |
| `wander scale` | 0.12 | — | Tamanho da célula de ruído (baixo = curvas largas) |
| `wander evolution` | 0.12 | — | Quão rápido o vento muda no tempo |
| `wander variance` | 0.15 | — | Espalhamento de curl **por agente** (0 = uniforme; 1 = ±100% do weight) |
| `wander pauses` | 0.2 | `pausas` | Ciclos parar/andar por agente — desliga enquanto migra (seek ativo) |
| `speed variance` | 0.2 | — | Espalhamento de velocidade **por agente** (0 = uniforme; 1 = ±100% do `speed ×`) |
| `speed ×` | 1 | — | × `max speed` para testemunhas |
| `gravity (UMAP)` | off | `gravity` | Liga o puxão dos agentes para o lugar que o **mapa semântico (UMAP)** deu a cada pessoa — histórias parecidas caem perto. É o que FORMA os núcleos |
| `map scale` | 14 | `mapScale` | Tamanho do mapa espalhado no chão (afasta/aproxima os núcleos entre si) |
| `gravity force` | 2.2 | `gravForca` | Força do puxão = velocidade na viagem = quem corre para chegar (doc 06, "onda de chegada") |
| `lens (element)` | none | `lens` | Reorganiza por **elemento** do relato (túnel, seres de luz…). Ligar força o seek mesmo com `gravity` off. Exclusiva com a demográfica |
| `lens (demographic)` | none | `dlens` | Reorganiza por eixo **demográfico** (sexo, década…). **Exclusiva** com `lens (element)`: ligar uma desliga a outra |
| `wires (graph)` | on | `wires` | Os **fios**: conexões entre pessoas que compartilham elementos |
| `wires alpha` | 0.22 | `wiresAlpha` | Opacidade base dos fios |
| `wires height` | 1.05 | — | Altura em que os fios arqueiam sobre o chão |
| `wires fade: near` | 6 | `wiresNear` | Distância abaixo da qual o fio está no máximo (leitura de perto) |
| `wires fade: far` | 14 | `wiresFar` | Distância acima da qual o fio some (evita a teia ilegível de longe) |
| `wires weight (gamma)` | 1.6 | `wiresGamma` | Curva que privilegia as conexões fortes (γ alto = só as mais densas acesas) |
| `wires only formed clusters` | off | `wiresFormed` | Só acende fios DENTRO de núcleos já formados (precisa de gravidade). Menos ruído, estrutura interna legível |
| `words (clusters)` | on | `labels` | Os **rótulos 3D** com o nome/tema de cada núcleo formado |
| `formation radius (cohesion)` | 2.4 | `formRaio` | Quão apertado um grupo precisa estar para contar como "núcleo formado" (dispara rótulo e outline). O fio começa a acender a 2× este raio — a chegada se anuncia antes da palavra confirmar |

> **Receita "ver os dados se organizarem":** `gravity (UMAP)` ON e observe os
> núcleos se formarem, os fios acenderem e as palavras aparecerem. Ligue
> `debug color = state` (**Field · physics**) para ver a onda de chegada.

---

## 4. Dormants — a massa sem história

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `formation` | wander | `formation` | **wander** · **circle** · **corridor** (precisa follow) · **clear** |
| `formation spacing` | 1.2 | `formSpacing` | Espaçamento na formação |
| `rim inset (wrap)` | 1.5 | `rimInset` | Recua o anel da costura do wrap (só com `world wrap` ON) |
| `wander while forming` | 0.35 | — | Curl en route ao anel/corredor: 0 = marcha, 1 = vento cheio |
| `lock at formation` | on | `formLock` | Perto do slot, curl desliga — moldura limpa |
| `wander weight` | 0.8 | — | Força do curl (só dormentes) |
| `wander scale` | 0.12 | — | Frequência do curl (max **0.8**; baixo = curvas largas, alto = redemoinhos apertados) |
| `wander evolution` | 0.12 | — | Quão rápido o vento muda no tempo |
| `wander variance` | 0.25 | — | Espalhamento de curl **por agente** (0 = uniforme; 1 = ±100% do weight) |
| `wander pauses` | 0.45 | `pausas` | Ciclos parar/andar por agente — desliga enquanto busca slot de formação |
| `speed variance` | 0.25 | — | Espalhamento de velocidade **por agente** (0 = uniforme; 1 = ±100% do `speed ×`) |
| `speed ×` | 0.7 | — | × `max speed` para dormentes (mín. 0) |

---

## 5. Follow — Field · coupling · Stage (treadmill)

O trio que faz seguir uma pessoa parecer atravessar uma multidão infinita.
Design no doc 04 §5.9/5.10; técnica (esteira + wrap + leme) no doc 03 §14.9.

**A ideia (mundo-toro + esteira):** no follow **a pessoa seguida fica pinada**
no lugar e o **mundo inteiro se desloca** ao redor dela (esteira) — os outros
agentes recuam, o chão scrolla, e o `world wrap` (§3) fecha a ilusão (quem sai
por trás volta na frente). No modo livre, a mesma regra de wrap vale para
todos.

### Field · coupling — campo do ativo e story field

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `field (follow)` | off | `field` | A pessoa seguida irradia uma **repulsão suave**: os outros abrem passagem em vez de atravessá-la |
| `field radius` | 2.5 | `fieldR` | Raio dessa bolha de repulsão |
| `field strength` | 1.2 | `fieldF` | Força dela |
| `yield to travelers` | 2 | `yield` | Separação **assimétrica**: quem tem alvo (migrando para um núcleo) empurra quem não tem até esse tanto mais forte. **WebGPU only** |
| `selected inertia` | 0.15 | `selInertia` | Quanta separação/contenção a pessoa SEGUIDA recebe de volta: 0 = imune (passa como um trem), 1 = igual a todos. **É o fix do tranco (stutter) no meio da multidão** — deixe baixo |
| `story field` | off | `storyField` | **social** = coroa + repel interno · **repel** = halo. **WebGPU only** |
| `story attract radius` | 2 | `storyR` | Coroa externa (só **social**) |
| `story repel radius` | 0,55 / 2 | `storyRepelR` / `storyHaloR` | **Social:** bolha interna · **Repel:** halo (`storyHaloR`) |
| `story attract strength` | 0,8 | `storyFAt` | Só **social** |
| `story repel strength` | 1 | `storyFRep` | **Social** + **repel** |
| `story field debug` | off | `storyDbg` | social = salmão+ciano · repel = salmão halo |

### Stage (treadmill) — esteira + leme

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `follow treadmill (pin)` | on | `stage` | LIGADO (padrão): pessoa pinada + mundo em movimento (esteira). DESLIGADO = follow legado que desloca a própria pessoa (para comparar/debug). **Exige `automatic states`** ligado (doc 06) |
| `treadmill speed` | 0.9 | `stageSpeed` | Velocidade **máxima** da jornada (com o mouse no fim da rampa) — e o teto no modo legado |
| `mouse steering` | on | `steer` | No follow, o mouse é o **leme**: direção + distância (além da deadzone) modulam rumo e velocidade |
| `steer strength` | 1 | `steerK` | Multiplicador da taxa de giro |
| `steer turn ease (s)` | 0,15 | `steerHTau` | Rumo seguir o mouse — menor = mais rápido |
| `steer speed ease (s)` | 0,2 | `steerSTau` | Velocidade subir/descer — menor = mais rápido |
| `steer speed ramp (m)` | 10 | `steerRamp` | Distância do mouse (além da deadzone) para atingir a velocidade máxima — mais longe = mais rápido + corrida no pino |
| `steer pivot` | pessoa (chão) | `steerPivot` | **pessoa** = chão; **centro da tela** = screen-space isotrópico |
| `steer wheel debug` | off | `steerDbg` | Anéis no chão na pessoa seguida |
| `steer debug scale` | 1 | `steerDbgS` | Tamanho dos anéis (só visual) |
| `pin stride/unit` | 48 | `pinStride` | Cadência dos pés **só do seguido** na esteira — independente do `stride/unit` global |
| `pin playback ×` | 1 | `pinPlayback` | Multiplicador geral (walk + run) |
| `pin walk playback ×` | 1 | `pinWalkBoost` | Extra só no **walk** do pino |
| `pin run playback ×` | 1.85 | `pinRunBoost` | Extra só no **run** do pino |

> **Regra de bolso:** `field (follow)` (**Field · coupling**) e formações
> (**Dormants** §4) existem para cenas em que a **legibilidade** vence o caos.

---

## 6. Focus & reading — hierarquia visual e leitura dos núcleos (só com acervo)

A camada que torna os núcleos exploráveis. Design no doc 04 §5.11/5.12.

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `label anti-overlap` | on | `labelAnti` | Resolve rótulos de núcleo que se sobrepõem na tela: o menor (menos membros) sobe com uma mola e some um pouco quando a câmera está longe demais para separá-los |
| `label distance falloff` | 0.35 | `labelDist` | Quanto os rótulos encolhem com a distância da câmera (hierarquia de leitura), com piso em 0,65× para não sumirem |
| `cluster outlines` | on | `outlines` | Um **anel circular** (stroke) no chão em volta de cada núcleo FORMADO (precisa de gravidade). Raio engloba o membro mais distante; respira devagar; custo ~zero |
| `outline alpha` | 0.16 | `outlineAlpha` | Opacidade máxima do contorno (o núcleo modula por cima) |
| `data view (birdseye)` | on | `dataView` | Acima da altura de câmera abaixo, as pessoas **desvanecem em discos coloridos** no chão — a leitura "circle packing" do acervo inteiro (1 draw call, ~zero custo) |
| `data view height` | 55 | `dataViewH` | Altura da câmera (m) em que os discos chegam a plena opacidade |
| `data view fade band` | 18 | `dataViewBand` | Faixa de altura (m) do crossfade pessoas↔discos (começo do fade-in) |
| `disc size` | 1 | `discSize` | Tamanho base dos discos na vista de dados |

> **Clicar num rótulo de núcleo** voa a câmera até ele, destaca os membros e
> abre um painel com os elementos do núcleo como chips filtráveis (doc 04
> §5.12).

---

## 8. Appearance — as cores do mundo

Tudo aqui é cor/estética; publica no store de aparência (custo por frame zero
— re-pinta na CPU só quando você mexe). Sem query params dedicados: persistem
pelo Preferences.

| Controle | Default | O que faz |
|---|---|---|
| `background (sky)` | — | Cor do fundo (o "céu" é o próprio fundo — não há dome) |
| `fog follows background` | on | Amarra a cor da névoa ao fundo. Desligue para dar à névoa uma cor própria |
| `fog color` | — | Cor da névoa (aparece só com o toggle acima desligado) |
| `ground` | — | Cor do chão |
| `grid color` | — | Cor da grade do chão |
| `grid alpha` | — | Opacidade da grade (0–1) |
| `dormant color` | — | Cor dos dormentes (o fundo vivo) |
| `muted gray (highlight)` | — | O cinza para onde os não-pertencentes colapsam quando você clica num chip da legenda |
| `wires: weak/strong color` | — | Cores dos fios fracos e fortes (interpolados pelo peso da conexão) |
| `labels follow cluster` | — | on = rótulos herdam a cor do núcleo; off = cor fixa (abaixo) |
| `labels color` | — | Cor fixa dos rótulos (com o toggle acima desligado) |
| `people: hue (°)` | 0 | Matiz GLOBAL das pessoas (−180…180) — gira a paleta inteira |
| `people: saturation` | 1 | Saturação global (0–2) |
| `people: brightness` | 1 | Brilho global (0–2) |
| `highlight: intensity` | — | Intensidade do destaque disparado por clique num chip da legenda (0–1) |
| `highlight: duration (s)` | — | Duração do envelope desse destaque (0.3–8 s) |

---

## 9. Terrain — o chão vivo

Um mesh só, deslocado por um heightfield compartilhado GPU/CPU (os pés grudam
na superfície). **Amplitude 0 (padrão) = chão plano**, idêntico ao antigo.
Técnica no doc 03 (M4f); design no doc 04.

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `enabled` | off | `terrainOn` | Liga o relevo |
| `preset` | custom | `terrain` | Escolher um preset **escreve os sliders abaixo** de uma vez (a matemática é a mesma) — ajuste à vontade depois |
| `amplitude` | 0 | `terrainAmp` | Altura do relevo (0 = plano) |
| `scale (freq)` | — | — | Frequência do noise (baixo = colinas largas; alto = terreno rugoso) |
| `octaves` | — | — | Camadas de detalhe do FBM (2–5) |
| `warp` | — | — | Distorção do domínio (0 = suave; 1 = torto/orgânico) |
| `seed` | — | — | Semente do relevo |
| `flatten radius` | — | — | Raio central achatado (deixa o palco plano no meio) |
| `flatten band` | — | — | Faixa de transição do achatado para o relevo cheio |
| `grid cell` | 0.25 | `gridCell` | Espaçamento das linhas do grid no chão |
| `grid edge fade (m)` | 0.35 | — | Suaviza o corte do grid na borda do disco (0 = círculo duro) |
| `noise tile period (m)` | 0 (auto) | `terrainTile` | Período do tile do relevo. **0 = 2× contenção** — independente de `world wrap` |

> O **raio do grid** segue `containment radius` (**Field · physics**). O tile do
> noise do chão também (auto), para o relevo não mudar ao desligar o wrap dos agentes.

---

## 10. Effects — pós-processamento, névoa e auto-preset

Mede o **custo real de cada efeito na sua máquina** e mostra ao lado do nome
(delta de GPU-time medido no toggle). Técnica no doc 03 §14.5.

| Controle | Default | qp | O que faz |
|---|---|---|---|
| `preset` | leve | `fx` | Combos prontos (troca vários efeitos de uma vez) |
| `auto (≥50fps)` | off | `fxauto` | **Auto-preset**: prova do mais pesado para baixo (5 s/degrau), fixa o mais alto que segura ≥50fps; depois vigia e degrada se cair 10 s seguidos. Não re-sobe sozinho |
| `bloom` (+ strength/threshold/radius) | — | — | Brilho estourado das luzes; força, limiar e raio |
| `AO half-res` (+ radius) | — | — | Oclusão de ambiente em meia-resolução; raio |
| `vignette` (+ strength) | — | — | Escurecimento das bordas; força |
| `fog (master)` | on | `fog` | **Liga/desliga TODA névoa**. Off = zero névoa (nem a linear clássica) |
| `height fog` (+ density/height/clouds/drift) | — | — | Névoa volumétrica de altura: densidade, altura (m), quantidade de "nuvens" e a deriva delas. Com o master on e este off, cai numa névoa linear clássica |
| `fog: recede height` | 16 | `fogRecuo` | Altura de câmera acima da qual a névoa de distância **recua** (god view limpo, chão enevoado). Subir a câmera acima disto revela o Campo; 80 ≈ nunca recua |

> A névoa `near`/`far` também aceita `?fogNear=` / `?fogFar=` na URL.

---

## 11. Preferences — salvar, restaurar, exportar, importar

O painel inteiro (todos os grupos, menos os botões) vira um preset persistente.

| Ação | O que faz |
|---|---|
| `save as default` | Grava TODOS os valores atuais no navegador — colam entre reloads (a URL ainda vence) |
| `restore factory` | Apaga o salvo e recarrega (voltam os defaults do código) |
| `export (clipboard + file)` | Copia e baixa `tuning.json` — o preset viaja entre máquinas (doc 03 §4.6) |
| `import: paste JSON` + `import` | Cole um `tuning.json` na caixa e aplique: vale na hora e já persiste como novo padrão |
| `status` | Feedback da última ação |

> **Merge tolerante:** chave salva que não existe mais é ignorada; controle
> novo usa a fábrica; tipo divergente cai na fábrica. Presets antigos com
> nomes de grupo em PT migram sozinhos na leitura (doc 06 §6).

---

## 12. Referência rápida de query params

Colar na URL depois de `?` (junte com `&`). Vence o salvo — ideal para links e
screenshots.

```
# população / cena
?grid=48 ?area=40 ?onlyPeople=1 ?scene=character ?follow=6
?followSmooth=0.35 ?followEase=0.45

# movimento
?speed2=0.8 ?sep=1.6 ?contain=21 ?wrap=1 ?debugAreas=1
?mouse=atrair ?mouseR=7 ?faceflip=1 ?debug=estado

# dados (só com acervo)
?gravity=1 ?mapScale=14 ?gravForca=2.2 ?lens=<elemento> ?dlens=<lente>
?wires=1 ?wiresAlpha=0.22 ?wiresNear=6 ?wiresFar=14 ?wiresGamma=1.6
?wiresFormed=1 ?labels=1 ?formRaio=2.4

# follow / mundo-toro
?field=1 ?fieldR=2.5 ?fieldF=1.2 ?yield=2 ?selInertia=0.15
?steer=1 ?steerK=1 ?storyField=attract ?storyR=2 ?storyF=0.6
?formation=corridor ?formSpacing=1.2 ?stage=1 ?stageSpeed=0.9

# hierarquia visual (só com acervo)
?labelAnti=1 ?labelDist= ?outlines=1 ?outlineAlpha=
?dataView=1 ?dataViewH= ?dataViewBand= ?discSize=

# terreno
?terrainOn=1 ?terrain=<preset> ?terrainAmp=2

# efeitos
?fx=<preset> ?fxauto=1 ?fog=1 ?fogRecuo=16 ?fogNear=14 ?fogFar=55

# animações (doc 06)
?estados=0 ?v0= ?v1= ?onda= ?pausas=
```

> Valores internos de dropdown seguem em PT (`?mouse=atrair`, `?scene=character`
> grava `personagem`, `?lens=<key da taxonomia>`), mesmo com rótulo EN no
> painel — ver doc 06 §6.

---

## 13. Receitas que cruzam grupos

**"Quero entender o mundo-toro"**
Field · coupling / Stage no follow + Field · physics → `debug areas` ON + `world wrap` ON.

**"Overview de dados, limpo"**
Witnesses `gravity` ON · Focus & reading `data view` ON · suba a câmera acima
de `data view height` · Effects `fog: recede height` baixo. Vira circle-packing.

**"Conduzir o olhar numa história"**
Follow ativo · Field · coupling `field (follow)` ON · Dormants `corridor` ·
`selected inertia` baixo · Stage `mouse steering` ON.

**"Screenshot reproduzível"**
Monte tudo na URL (§12) — a URL vence o que estiver salvo. Ex.:
`?grid=32&gravity=1&fx=leve&follow=6&debugAreas=0`.

**"Voltar ao chão plano / sem névoa / sem efeitos"**
Terrain `amplitude` 0 · Effects `fog (master)` OFF · Effects `preset` = o mais
leve (ou desligue bloom/AO/vignette um a um vendo o custo medido).

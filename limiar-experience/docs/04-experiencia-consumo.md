# LIMIAR — A Experiência de Consumo (UX)

> **Papel deste documento:** consolida as decisões de UX das sessões de
> 2026-07-10 e 2026-07-12 (Dudu + agente). Estende o doc 01, resolve suas
> perguntas abertas (§11) e adiciona as mecânicas novas. Onde este doc e o 01
> divergirem, **este vence** (é mais recente); a técnica que o serve continua
> no doc 03.

---

## 1. O que isso é (categoria e postura)

Um **documentário navegável** — ou memorial interativo de dados. Internamente,
pensamos nele como **um lugar que se visita**, não um app que se usa nem um
jogo que se joga: um memorial vivo onde as lápides andam, respiram e, se você
parar para ouvir, falam com a própria voz.

Triângulo de referências que define o gênero:

- ***Journey*** — travessia contemplativa, anonimato, comunicação sem palavras;
- ***The Fallen of WWII*** (Neil Halloran) — estatística que vira soco emocional;
- ***We Feel Fine*** (Jonathan Harris) — cada ponto de dado é uma pessoa real.

LIMIAR vive no centro desse triângulo.

## 1.1 Princípio: um sistema se organizando, não ruído (2026-07-12)

Formulação do Dudu, elevada a princípio de teste — irmã do arrepio-tese (§2)
no papel de régua:

> **O Campo deve sempre parecer um organismo ordenando-se — nunca ruído.**

Já estava latente no doc 01 (Ato 3: "um organismo se ordenando, não um
gráfico dando refresh"); agora vale para **tudo**, não só para a gravidade.
**Clareza de leitura vence densidade de acontecimentos**: se uma mecânica
visual nova (fios, palavras, animações, lentes, maré) deixa a cena mais
cheia mas menos legível, ela está errada — recua, filtra ou espera sua vez.
Toda mecânica visual nova se testa contra isso, na mesma mesa em que se
testa contra o arrepio-tese do §2.

**Nota de leitura — o terreno (2026-07-13, M4f):** o Campo ganhou relevo
opcional (colinas por heightfield, grupo Terrain), e este princípio é o que
o disciplina: o centro fica **PLANO por design** (`flatten radius` — um
anfiteatro) para os núcleos se formarem em leitura limpa; as colinas moram
na borda, onde são horizonte e não obstáculo. Amplitude nasce em 0 — o
relevo é decisão do criador, não default.

## 2. A emoção central (a tese em uma frase)

> **A vertigem de perceber que centenas de estranhos, que nunca se conheceram,
> descrevem a mesma coisa.**

Esse é o arrepio-tese. A experiência inteira é preparação para ele e
consequência dele. **Toda decisão de design se testa contra isso:** aproxima ou
dilui esse momento?

## 3. O arco de uma primeira visita (~30–45 min)

1. **Estranheza (2–3 min).** Fade do branco. Névoa, figuras cinzentas, nenhuma
   UI. Uma única frase: *"Tudo o que você vai ouvir aqui foi contado por
   pessoas reais."* — a chave que rearma toda a escuta. O tutorial é sonoro
   (sussurros posicionais); ninguém precisa dizer "clique nas pessoas".
2. **O primeiro rosto (5–15 min).** Onde o visitante decide se fica — precisa
   ser perfeito. Voz real entra; no timestamp em que ela diz "e aí eu morri", a
   figura cai e o Campo inteiro para por dois segundos. Depois: o corpo no chão
   enquanto a voz descreve o outro lado.
3. **O reconhecimento (2ª–3ª história).** Regra de ouro: **o visitante percebe
   o padrão sozinho, antes do sistema mostrar**. Os fios se acendem *depois* da
   intuição, confirmando: "sim, você viu certo — e há mais quarenta dessas."
   Revelação antes da intuição = infográfico; depois = descoberta.
4. **A vertigem (constelação).** Subir e ver que não eram três histórias — eram
   quatrocentas. E o movimento inverso importa igual: tocar um ponto e descer,
   e a estrela virar gente de novo, com voz e nome.
5. **O retorno.** Ouvir uma pessoa nova já sabendo o mapa: a experiência muda
   de natureza no meio — de exploração para leitura. É a rejogabilidade sem
   "conteúdo novo".
6. **A saída.** Não há tela de fim, mas há um gesto digno: o Campo escurece de
   volta à penumbra e uma linha — *"O Campo continua aqui."* Sair é sair de um
   lugar, não fechar uma aba. Progresso persiste.

## 4. Consumo de uma história (decisões fechadas)

- **Resumo por beats como padrão.** O corte editado (3–7 min) do essencial —
  os achados, sem ruído, pausas e rodeios — É a experiência (resolve doc 01
  §11.2). A pessoa segue os estados VAT do doc 01 §4 durante a escuta.
- **Três níveis de profundidade, custo quase zero:**
  1. corte editado por beats (no Campo, padrão);
  2. áudio na íntegra (no Campo, pessoa em estado contemplativo — andando,
     ajoelhada — enquanto fala);
  3. **o vídeo original no YouTube** (link direto): a entrevista já é a versão
     visual da íntegra, e o link credita o canal — alimenta a futura parceria.
- **Timeline de beats no follow.** UI minimalista com hotspots — os momentos
  importantes extraídos pelo pipeline. Pular entre hotspots é **navegação
  estruturada, não scrub**: salta-se de achado em achado, sem seek bar
  arbitrário.
- **Colher exige ouvir** (inalterado, doc 01 §7): o elemento só é colhido se o
  trecho foi escutado. Quem pula tudo não colhe nada — consequência, não
  punição. É a mecânica protegendo a ética.

### 4.1 A cadeia de interação, refinada (2026-07-12, para o M4)

A escada hover → clique → escuta, fechada com o Dudu:

1. **Hover = apresentação.** Passar o cursor sobre uma pessoa faz seu **nome
   aparecer em texto flutuante que a segue** (billboard discreto, fade
   rápido) — e, junto, o **sussurro da Sintonia** (§5.1): identidade e voz
   no mesmo gesto, sem nenhum painel. É o "quem é você?" respondido antes
   do clique.
2. **Clique = compromisso.** Clicar entra no **follow em terceira pessoa**
   (rig do doc 03 §6) e a história começa — o corte editado por beats
   (padrão acima).
3. **Durante a escuta**, a **timeline minimalista com hotspots** já decidida
   acima ganha forma concreta: uma linha fina com marcas clicáveis e o
   texto do momento (o rótulo do beat) — **saltar entre momentos** da
   história, não scrub arbitrário. Continua navegação estruturada.

Nada disso adiciona UI persistente: nome e timeline só existem enquanto o
gesto (hover, follow) existe.

### 4.2 A cadeia no ar (2026-07-13 — M4c/M4d/M4e implementados)

A escada do §4.1 saiu do papel, ainda sem o áudio:

1. **Hover** — a pessoa REAL sob o cursor (dormentes não respondem — quem
   tem história fala) ganha o **nome flutuando** sobre a cabeça: billboard
   com fade de ~0,25 s, cor da paleta de labels (segue o núcleo ou fixa,
   grupo Appearance), cursor vira pointer. *Refeito em 2026-07-13 (feedback
   "não tá preciso"):* o acerto agora é em **screen-space** — mirar o corpo
   NA TELA acerta (elipse do tamanho aparente; sobrepostos → o da frente
   vence), em vez do antigo raio de 1,2 m ao redor do ponto do mouse no
   chão, que falhava ao apontar para tronco/cabeça (doc 03 §14.6).
2. **Clique = follow em 3ª pessoa** — a câmera viaja até atrás/acima da
   pessoa e ACOMPANHA (órbita e zoom seguem livres — o OrbitControls não
   desliga). ESC ou clique no vazio solta, sem teleporte. Arrastos de
   órbita nunca disparam clique. *Refeito em 2026-07-13 (feedback "vai até
   um ponto e dá um snap"; "quero tudo bem suave"):* a viagem virou
   **springs contínuas sem fases** — não existe mais "fim de transição"
   (era a costura do snap), clicar em outra pessoa emenda uma viagem na
   outra, e a câmera segue uma posição **suavizada** da pessoa (espelho
   interpolado + spring `follow smoothing`): no meio da multidão densa,
   com colisões, o enquadre fica parado feito tripé — sem tremor (meta
   medida: <1 mm/frame de ruído de alta frequência; doc 03 §14.6).
3. **Timeline da história** — aparece só no follow, bottom-center (a
   Legenda desvanece — uma voz por vez, §1.1). *Redesenhada em 2026-07-14
   (feedback do Dudu: "timeline com item demais espremido… quero algo mais
   clean… coisas mais claras e padronizadas entre as pessoas"):*

   - **Estações canônicas como default — a gramática comum.** Em vez de
     despejar todos os beats, a linha mostra um conjunto FIXO de estações,
     sempre com os mesmos nomes e na mesma ordem para toda pessoa (só
     aparecem as presentes): **Antes · A morte · O outro lado · A virada ·
     O retorno · Depois**. É a tese do projeto na UI: a mesma travessia,
     marcos padronizados, palpáveis. Derivação de `beats[].type` +
     `arc.virada` (primeiro beat de cada fase, com âncoras de ordem
     narrativa — ver `src/ui/timelineStations.ts`); cobertura no corpus de
     86: Antes 85/85 · A morte 74 · O outro lado 85 · A virada 82 ·
     O retorno 78 · Depois 84. Pontos maiores, rótulo pequeno sempre
     visível embaixo (≤6, nunca espreme), cor pela valência do beat;
     virada que coincide com outra estação vira o anel dela.
   - **Filtro de consumo** — o que a linha mostra são "pontos a serem
     consumidos", e isso é um filtro: texto-botões minúsculos à direita
     acima da linha (estética de rádio antigo) — **estações** (default) ·
     **momentos** (todos os beats, pontos pequenos sem rótulo — a
     densidade vira opção, não imposição) · **o elemento da lente ativa**
     (só aparece com lente de elemento no Campo: pontos = quotes com
     `t_norm` daquele elemento no JSON da pessoa — onde AQUELE fenômeno
     acontece nesta história; pessoa sem o elemento = linha vazia,
     honesto). Troca de modo = crossfade suave. Default via pref
     (`Scene.tlmode`), `?tlmode=stations|all|element`.
   - **Layout clean** — sem retângulo/painel: a linha flutua sobre a cena
     (~48% da largura, sombra leve para legibilidade). Nome da pessoa em
     caixa alta minúscula acima à esquerda; **entrada/saída do arco viraram
     tooltips dos extremos da linha** (hover no início/fim — informação
     sob demanda, não mobília); resumo do beat/estação só no hover, uma
     linha acima com crossfade (padrão da frase da Legenda). Atração da
     linha ao mouse mantida, mais sutil (é o charme, não o protagonista).
   - Anel na virada, cores por valência (fria→quente) e clique-seleciona
     continuam. **v1 é visual** — tocar o corte de áudio do beat é a
     próxima etapa (Supabase, §5.2).

Pendências assumidas: áudio (a Sintonia §5.1 e o corte por beat), e o
espelho de posições (doc 03 §14.6) como limite conhecido — se a latência
de readback incomodar em multidões maiores, o upgrade é picking GPU.

## 5. As mecânicas novas (batizadas em 2026-07-10 e 2026-07-12)

### 5.1 A Sintonia (hover-rádio)

O cursor como **órgão de escuta separado do corpo**. Passar o mouse perto de
alguém sintoniza seu murmúrio em fragmento inteligível por um instante — como
girar o dial de um rádio entre estações, ou escutar pensamentos ao passar.
Cria dois raios de atenção distintos: onde você *está* (câmera → sussurros
ambiente) e onde você *aponta* (cursor → sintonia). Profundidade exploratória
sem nenhuma UI.

- **Dados:** os mesmos cortes de áudio do export (`whisper.mp3` / quotes).
- **Custo:** baixo — spatial audio + fade por distância do cursor.
- **Entra em:** M7 (áudio), protótipo simples possível no M4.

### 5.2 O Coro (áudio sincronizado por contexto)

Hover sobre um núcleo (ou um fio) toca **o mesmo elemento contado por vozes
diferentes**, sincronizadas no mesmo momento semântico: "eu vi um túnel…" /
"era como um corredor de luz…" / "algo me puxava…". A tese inteira do projeto
(mesma verdade, palavras diferentes) convertida em experiência sonora direta,
sem um número na tela.

Depois da gravidade, **cada núcleo murmura seu tema**: o Campo vira uma
paisagem sonora navegável — aproximar-se de um núcleo é aproximar-se de uma
fogueira de conversa.

- **Dados:** quotes por elemento com timestamps (pipeline já extrai);
  "sincronizar" = tocar trechos do mesmo elemento em sequência/leve
  sobreposição.
- **Custo:** moderado. Payoff: potencialmente **a cena da experiência**.
- **Entra em:** M6 (constelação/clusters), com semente no M5.

### 5.3 As Lentes (re-clusterização temática interativa)

Cada tema desbloqueado vira uma **lente clicável** na visão de cima (god
view). Aplicar a lente **reorganiza o Campo em torno daquele tema**: quem o
viveu gravita, quem não, recua. Vai além do layout UMAP fixo do doc 03 — é
re-clusterização interativa dirigida pela curiosidade do visitante.

- **Dados:** pertencimento por elemento (já no contrato do export).
- **Custo:** a simulação do M2 já move agentes para `targetPos` dinâmico; o
  trabalho é o layout por lente (radial por pertencimento ou pré-calculado).
- **Entra em:** M6, protótipo debug possível no M3.

### 5.4 A Maré (scrub global de tempo + degradê emocional) — 2026-07-12

Os dois modos de consumo da experiência, nomeados: **seguir UMA história**
(o follow, §4) ou **ver TODAS em sincronia** — a Maré.

A Maré é um **scrub global de tempo normalizado** (0 → 1 = início → fim de
cada história, cada uma no seu próprio ritmo): arrastar o tempo faz **cada
figura viver a fase da própria história** naquele ponto — beats dirigindo
estado de animação e cor como no follow, mas para todas ao mesmo tempo.
Como as histórias têm estruturas diferentes (uma pessoa passa metade do
relato na EQM, outra três quartos na integração), **clusters temporais
formam-se e dissolvem-se** diante do visitante: a onda de quedas, o grupo
que ainda está "lá", os que já voltaram. É a tese do projeto em modo
panorâmico — a mesma travessia, centenas de ritmos.

O **degradê emocional** é a pele visual da Maré: a cor/luz de cada figura
evolui pela valência do beat que ela está vivendo — o Campo inteiro
escurece na onda das mortes e reaquece na onda dos retornos. Evolução
visual, não efeito: é dado temporal tornado atmosfera. No follow, o mesmo
degradê vira a evolução da figura seguida (entrada → virada → saída); no
agregado, vira o clima do Campo em cada ponto do scrub.

**Dados reais desde 2026-07-12 (passada `acervo arc` + timeline
normalizada):** cada pessoa do export carrega `arc` (valência -2..+2 por
beat com label curto, `entrada`/`saida` com uma frase e valência cada,
`virada` = índice do beat do ponto de virada) e `timeline_norm` (duração
total da história + offset de cada parte); cada beat e cada quote ganharam
`t_norm` [0,1] — o scrub global é uma consulta, não uma conta. O achado
agregado do corpus de 46 dá o formato da onda: quase todo mundo entra
baixo (média −0,84) e sai no teto (+1,98 — 44 de 45 saem em +2), com a
virada cedo na história contada (t_norm mediano 0,15, quase sempre num
beat de EQM) — a Maré tem, portanto, uma subida coletiva previsível, e as
exceções (arcos internamente sombrios, viradas tardias) são exatamente o
que impede a onda de virar clichê.

Regras de honestidade (herdam o §9 e o req. 7 do doc 02):

- **Tudo deriva de timestamps e valências extraídas com validação** — a
  valência é por beat, calibrada nos trechos do transcript e revisável na
  UI do acervo (bloco "Arco"); `t_norm` é aritmética sobre as durações
  reais das partes. **Nenhuma coreografia inventada**: se a figura cai no
  scrub 0,3, é porque a pessoa contou a morte naquele ponto da própria
  história.
- Beats de moldura do canal (vinheta, apresentação, encerramento) são
  neutros por regra de prompt — a onda emocional vem do relato, não da
  edição do vídeo.
- Lacunas são marcadas (`needs_attention`), nunca preenchidas em silêncio.

- **Dados:** `arc` + `timeline_norm` + `t_norm` em beats/quotes (export,
  manifest `d27de65adf0ea1d3`).
- **Custo:** moderado — a state machine por agente (doc 03 §4.2) já é
  dirigida por comandos; a Maré é "todos os diretores ao mesmo tempo" +
  um controle de scrub. Estados por agente (§5.5) + valência por beat
  dirigem animação e cor. Respeita o princípio §1.1: a leitura vem das
  ondas, não do caos.
- **Entra em:** pós-M6 (precisa de beats reais por pessoa no Campo);
  protótipo debug possível quando o M4 fechar o beat→estado.

### 5.5 Estados de animação como linguagem da simulação (2026-07-12)

Os clipes deixam de ser decorativos: **a animação comunica o estado do
agente na simulação** — o visitante lê o Campo pelo corpo das figuras:

| Animação | O que diz |
|---|---|
| Parada / idle | Sem contexto ativo — ninguém a chamou, nada a puxa |
| Andar | Buscando — gravidade/lente moderada, a caminho |
| **Correr** | **Chamado forte** — longe do alvo com atração alta |
| Assentar (idle ou ajoelhar/rezar) | Chegou ao núcleo, encontrou o lugar |

Regras fechadas com o Dudu:

- **Transições dirigidas pela velocidade REAL da simulação, com histerese**
  — nunca por script. O agente corre porque a física o puxa forte; a
  histerese impede flicker andar↔correr na fronteira. A animação é
  instrumento de medição da sim, não coreografia.
- **Onda de chegada:** quem está mais distante do alvo corre mais — os de
  longe alcançam enquanto os de perto assentam, e a formação de um núcleo
  fica **rápida E legível** (princípio §1.1: organismo, não ruído).
- **Chegada com ponderação poética:** ao assentar no núcleo, a figura cai
  em idle ou ajoelha/reza — e **quem carrega `transformacao` tende a
  rezar**. O dado escolhe o gesto.
- **No follow, o morph continua dirigido pelos beats** (doc 01 §4 — queda
  na morte, hold, levantar, rezar): a Maré e o follow usam a mesma máquina
  de estados; muda quem comanda (beats da história vs. física do Campo).
- Clipe de corrida não existe no VAT legado (6 clipes) — entra pelo
  guarda-roupa próprio do VAT Studio (doc 03 §14).

- **Dados:** velocidade/distância-ao-alvo já vivem nos buffers da sim;
  `transformacao` vem do export.
- **Custo:** baixo — a state machine do doc 03 §4.2 ganha limiares por
  velocidade com histerese; o crossfade A/B já existe desde o M0.5.
- **Entra em:** M4–M5 (junto da gravidade progressiva); a base técnica
  do M2/M3 já suporta.
- **✔ Implementado (M3.6, 2026-07-12)** — tudo acima está no ar (doc 03
  §14.4): parado⇄andando⇄correndo pela velocidade real com histerese,
  onda de chegada, assentar idle/rezar com peso de `transformacao`, pausas
  orgânicas (a multidão mista existe sem gravidade) e grupos com-história/
  dormentes. "Correndo" usa walk acelerado até a VAT ganhar um clipe de
  corrida do Studio (detecção automática por nome). O que fica para o
  M4/Maré: BEATS por pessoa comandando os estados (queda/hold/levantar) —
  os slots z/w do meta por agente já estão reservados.

### 5.6 Fios com leitura inteligente (2026-07-12)

Os fios (doc 03 §4.5) ganham regras de legibilidade — consequência direta
do princípio §1.1 aplicada ao grafo:

- **Alpha por distância dos endpoints:** fio entre pessoas distantes é mais
  tênue; ao se aproximarem, o fio se afirma. A migração fica legível sem
  teia de aranha global.
- **Peso visual por afinidade:** o `weight` da aresta (já no export) vira
  espessura/brilho — conexões fortes se destacam sozinhas.
- **Modo "só núcleos formados":** os fios só aparecem quando **os dois
  lados assentaram** nos seus núcleos — durante a migração, silêncio
  visual; quando o sistema se ordena, as conexões se revelam. Menos ruído
  exatamente na fase mais caótica.

- **Dados:** arestas + weight (export); estado "assentado" vem da sim (§5.5).
- **Custo:** baixo — os fios já leem posições vivas na GPU (M3); é
  modulação de alpha/espessura por dados que já existem.
- **Entra em:** M5–M6 (revelação progressiva já era o plano; isto define
  o *como*).

### 5.7 Palavras no espaço (2026-07-12)

Quando um núcleo **se forma** (coesão atingida — os membros assentaram), o
**nome do núcleo aparece em texto 3D flutuante no centro do grupo**: fade
lento, billboard (sempre de frente para a câmera), tipografia discreta.
"Ilustrar o que estamos vendo em cada cluster" (Dudu) — o Campo passa a se
explicar sozinho, sem HUD.

É a versão espacial do que o doc 01 §5 (Ato 3) prometia ("núcleos ganham
nome quando ele os visita") — o nome agora vive **no mundo**, não num
painel. Some quando o núcleo se dissolve (lente trocada, gravidade
desligada): palavra também é estado, não etiqueta permanente.

- **Dados:** nomes dos núcleos via LLM (já no export do A3).
- **Custo:** baixo — texto SDF/troika billboard por núcleo, fade por
  coesão (métrica barata: distância média ao centroide).
- **Entra em:** M6 (constelação/clusters); protótipo debug junto das
  Lentes v0.

### 5.8 Lentes demográficas (2026-07-12 — estende §5.3)

As Lentes do §5.3 reorganizam por **fenomenologia** (elementos vividos).
A passada demográfica do acervo (2026-07-12) abre o segundo eixo: **lentes
por quem a pessoa é / onde / quando** — eixos declarados no corpus, nunca
inferidos:

- **Sexo**, **causa da morte**, **geografia** (estados/países do evento),
  **profissão**;
- **Trajetória religiosa** — religião na época × hoje: o padrão descoberto
  no corpus ("católica antes → espiritualidade própria depois") vira lente
  navegável: o Campo mostra o fluxo entre margens;
- **Década do evento como linha do tempo física**: 1969 → 2025 atravessando
  o Campo — as figuras se ordenam sobre uma linha temporal andável;
- **A lente do TEMPO**: tempo clínico declarado × tempo subjetivo — "20
  minutos que viram uma vida". Os dois valores existem no corpus
  (`tempo_clinico`, `tempo_subjetivo`); a lente confronta as duas durações
  da mesma experiência.

Regra de honestidade (herda o princípio 5 do doc 00): **campo null vai
para a faixa "não declarado"** — visível, nunca escondida, nunca
preenchida por inferência. O buraco no dado também é dado.

- **Dados:** bloco `demographics` no export (hash `c8c437af007d3008`,
  cobertura 28–42/46 conforme o campo).
- **Custo:** igual às Lentes §5.3 (layout por faixa em vez de
  tem/não-tem); a linha do tempo é um layout linear com marcos de década.
- **Entra em:** M6, junto das Lentes completas; debug possível no M3+
  (o dropdown de lentes já existe).

### 5.9 Formações da multidão e o Campo do ativo (2026-07-14)

Duas mecânicas para o Dudu **moldar a multidão ao vivo** — nascidas da
tensão entre o §1.1 (organismo legível) e o gosto dele pelo **caos vivo de
uma calçada de NYC**: gente que se esbarra, atravessa, apinha. A resposta
não é escolher um lado — é dar ao criador o dial. Por isso as duas são
**opções com sliders, nunca comportamento fixo**; o caos continua sendo o
estado natural do Campo.

**O Campo do ativo** (grupo "Active field" do painel): quem está **ativo**
irradia uma abertura.

- **Pessoa seguida** (clique/follow): repulsão radial suave (raio e força
  tweakáveis, defaults 2,5 m / 1,2) — os não-ativos **desviam** dela em
  vez de atravessá-la ou apinhar em volta. Presença física, não
  hierarquia: até quem tem alvo desvia. Funciona nos dois backends
  (uniform, sem custo de buffer). Medido: vizinhos a <3 m da pessoa caem
  de ~31 para ~12 (WebGPU) e ~32 para ~5 (WebGL2 — sem separação
  re-empurrando, o círculo fica mais limpo).
- **Migrantes** (com alvo, a caminho do núcleo): peso **assimétrico** na
  separação — quem viaja empurra até N× mais forte quem só vaga
  (`yield to travelers`, 1–3, default 2): a multidão **abre alas** para
  quem foi chamado. Só existe no WebGPU (o fallback WebGL2 não tem
  separação desde o M2 — limitação conhecida, doc 03 §10).

**Formações dos dormentes** (grupo "Formations"): o que os sem-história
fazem enquanto os ativos migram — dropdown dinâmico, para moldar a cena
ao vivo:

- `wander` — o estado natural (caos vivo, default);
- `circle` — anel grandão na borda (0,92× contenção, 2 fileiras
  intercaladas, jitter estável por slot): a multidão vira **moldura** e
  testemunha enquanto os núcleos se formam no miolo;
- `corridor` — duas sebes de 3 camadas ladeando o **caminho da pessoa
  seguida** (final de maratona). Exige follow ativo (sem ele cai em
  wander). O corredor é **ancorado no mundo** e só re-ancora quando a
  pessoa atravessou ~35% dele ou mudou de rumo de verdade — alvo que
  persegue por frame vira turba, não corredor (aprendido na sonda);
- `clear` — todos recuam ao anel da contenção máxima: **palco vazio**,
  foco total no que sobrou no centro (cenário, núcleos, uma pessoa).

Chegando na formação eles **assentam sozinhos** pela máquina de estados
existente (§5.5) — idle/rezar pelo sorteio de sempre. Animação PRÓPRIA de
formação (postura de espectador, aplauso, reverência…) virá pelo
Vocabulary (doc 06) quando o VAT Studio assar os clipes — a formação já
escolhe *onde*; o Vocabulary escolherá *como*.

- **Dados:** nenhum novo — alvos calculados na CPU (mesma via do M3).
- **Custo:** ~zero (46+dormentes escritas por mudança; corridor recomputa
  a cada ~0,8 s).
- **Entra em:** já no ar (painel debug); coreografia por beat = M6 (§5.10).

### 5.10 O Palco: cenas de história e a ilusão da viagem (2026-07-14 — roadmap M6 "cenas de história")

A visão completa do Dudu para o **consumo de uma história** dentro do
Campo — registrada por inteiro aqui; a fundação técnica (esteira) já está
no ar atrás do toggle `story treadmill`.

**A referência dele:** uma experiência anterior em que **o personagem
nunca se movia — o ambiente fazia TODO o movimento**. A pessoa anda no
lugar; o mundo viaja por ela. É a gramática de palco que ele quer para as
cenas de história: a câmera nunca larga a pessoa, e ainda assim ela
atravessa mundos.

**A esteira (fundação, no ar):** durante o follow, com o palco ligado —

1. a pessoa seguida é **pinada** (velocidade→0) mas segue **andando** no
   lugar (a state machine força walking; a cadência do passo casa com a
   velocidade da esteira — os pés não patinam no chão que anda);
2. o **terreno scrolla** sob os pés: o domínio do noise do heightfield (e
   as linhas do grid) desliza na direção contrária ao andar — GPU e CPU em
   paridade (sim, chão, fios e marker leem a MESMA altura deslocada); o
   anfiteatro (flatten central) fica ancorado no mundo;
3. os **dormentes da janela do palco** (caixa local orientada pelo rumo da
   viagem) viram **cenário em loop**: recuam à velocidade da esteira e,
   ao sair pela borda de trás, **reaparecem na frente** (wrap modular no
   espaço local do palco) — com a formação `corridor` ativa, é a sebe de
   maratona passando para sempre;
4. os alvos/cluster dos carregados ficam **suspensos** durante o palco
   (seek×0 dentro da janela) — a história pausa o mapa.

**Aonde isso vai (M6 — "cenas de história"):** a esteira é o chassi de um
**modo palco por trecho narrativo**, dirigido pelos beats (arco emocional
do acervo):

- **objetos e instâncias passando em loop** (módulo+offset, o mesmo wrap
  dos dormentes): pedras, árvores, ruínas, portais — cenário infinito
  barato por instancing;
- **partículas** em fluxo contrário ao andar (poeira, pétalas, neve,
  fagulhas — vocabulário O(elementos), §8);
- **o chão dá *bend***: o plano dobra progressivamente em cilindro
  envolvendo a câmera — em alta velocidade a viagem vira **túnel de luz**
  (o túnel dos relatos SEM asset de túnel: é o próprio mundo dobrando).
  Evolução natural do heightfield (mesma função de altura, re-mapeada em
  coordenadas cilíndricas no positionNode);
- **trocas de ambiente por trecho da história**: limbo/almas no evento da
  morte, campos de flores, cidades, outras dimensões, seres de luz — cada
  beat pode trocar terreno/névoa/cor/população do palco (as vinhetas por
  elemento do §8, agora encadeadas pela timeline);
- **estados da multidão por momento narrativo**: formação/caos/ausência
  (§5.9) viram direção de cena — o corredor na travessia, o clear no
  vazio, o wander no retorno ao mundo.

- **Dados:** beats com `t_norm` + valência (já no export); elementos por
  beat para escolher a vinheta.
- **Custo:** a fundação é ~zero (uniforms + wrap no update pass); bend
  cilíndrico e vinhetas são o investimento do M6.
- **Entra em:** fundação **no ar** (experimental, `?stage=1`); cenas
  completas = **M6 "cenas de história"** (aditivo à tabela do §11).
- **Riscos vigiados:** kitsch (§10.2 — na dúvida, menos) e artefatos de
  borda da janela (aceitos na fundação; resolvidos por fade/névoa nas
  cenas reais).

## 6. O loop de descoberta (fechado)

```
escutar → desbloquear tema → aplicar lente → o Campo se reorganiza
   ↑                                                    ↓
   ←── novas histórias a escutar ←── novas conexões visíveis
```

Cada volta aprofunda o quebra-cabeça: é como desvendar algo que se encaixa
cada vez mais — verdades que parecem as mesmas, contadas com palavras,
interpretações e backgrounds diferentes.

### 6.1 Legenda viva — a semente da UI da experiência (2026-07-12)

Primeira peça de UI pensada **fora de qualquer painel de debug**: uma
**legenda minimalista premium** do que está em cena — chips discretos de
cor + label + contagem (núcleos visíveis, lente ativa, faixas demográficas)
que **acompanham o estado do Campo com transições suaves**: um chip nasce
quando seu grupo entra em cena, esvanece quando sai.

Decisões:

- **É o início da identidade visual do LIMIAR**: cinzas quentes como base,
  cor **apenas como dado** (herda doc 01 §9) — a legenda é a primeira
  superfície onde essa linguagem vira UI de verdade.
- **Interativa sem virar menu:** clicar num chip **destaca o grupo** no
  Campo (os demais recuam sutilmente) — irmã leve das Lentes; um segundo
  clique solta. Nada de checkboxes, nada de painel.
- Respeita as regras do §7: na escala íntima a legenda recolhe (nunca
  números no chão); na god view / constelação ela é bem-vinda.
- Relação com o Diário (doc 01 §5): o Diário é o objeto pessoal do
  visitante; a legenda é a leitura do **estado presente da cena**. Papéis
  diferentes, sem fusão.
- **A frase do visitante (2026-07-12):** cada lente ativa (elemento,
  adjacente ou lente demográfica) mostra no bottom a sua
  `frase_visitante` — uma linha da voz editorial do LIMIAR desmistificando
  o que se vê ("Estas pessoas relatam ter existido em mais de um lugar ao
  mesmo tempo…"), fiel ao corpus e sem jargão. Fonte:
  `acervo/taxonomy.yaml` → `taxonomy.json` do export (campos em
  `elementos`, `adjacentes_detalhe` e `lentes_demograficas`).

- **Dados:** nomes/cores dos núcleos, contagens, lente ativa — tudo já no
  contentStore do M3.
- **Custo:** baixo (DOM/HTML sobre o canvas, como o HUD do M3 — que ela
  substitui e eleva).
- **Entra em:** M4+ como evolução do HUD debug; versão premium no M6/M7.
- **✔ Destaque forte (2026-07-12, pedido do Dudu):** o clique no chip
  ganhou contraste máximo — os selecionados mantêm a cor PLENA e todo o
  resto **colapsa para um cinza uniforme** (mesmo tom para todos, não uma
  dessaturação sutil), segurando pelo tempo configurado e voltando com
  fade-out suave. Intensidade e duração viraram sliders ("destaque:
  intensidade/duração", grupo Aparência) — o "os demais recuam sutilmente"
  de cima passa a ser o piso, não o teto.

### 6.2 A cena é do criador — aparência e preset persistente (2026-07-12)

Pedido direto do Dudu: as escolhas dele têm de "grudar" entre reloads.

- **Grupo "Aparência"** (leva): cores do mundo — fundo/céu, névoa (segue o
  fundo por default; dá para soltar), chão, grid (cor+alpha) — e o ajuste
  GLOBAL de matiz/saturação/brilho das PESSOAS (paleta de núcleos e
  dormentes juntos). O Campo continua "cinzas quentes, cor como dado"
  (doc 01 §9) por default — mas agora o criador pode temperar o mundo sem
  tocar em código.
- **Névoa dominável**: toggle master (off = céu limpo de verdade) e **recuo
  por altura da câmera** — subiu além da "altura de recuo", a névoa de
  distância abre e o god view enxerga o Campo inteiro (o chão continua
  enevoado: a névoa segue personagem, doc 01, mas deixa de engolir a
  leitura de cima).
- **Grupo "Preferências"**: salvar como padrão / restaurar fábrica /
  exportar / importar — o painel INTEIRO vira preset (o `tuning.json` do
  doc 03 §4.6). Query params continuam vencendo (screenshots e links de
  verificação não mudam de comportamento).

## 7. Regras de linguagem por escala

- **No chão, nunca números.** Escala íntima = gente, voz, nome próprio —
  narrativa. Percentuais, contagens e agregados só existem na constelação.
  Duas escalas = duas linguagens; misturar quebra as duas.
- **Lentidão embaixo, agilidade em cima.** Câmera com inércia, sem sprint nem
  teleporte na escala íntima; a constelação pode ser ágil.
- **O Diário é um objeto, não um menu.** Caderno de campo: entradas que
  parecem anotadas, citações literais. É a única UI persistente — carrega o
  tom inteiro do projeto.
- **Voz acima de tudo na mixagem.** Cama generativa e sons de sistema recuam
  quando alguém fala (ducking suave). O áudio real é o material sagrado.
- **Legendas PT desde o dia 1** — muita gente vai querer ler junto; a legenda
  dá materialidade à palavra dita (EN depois, para alcance).
- **Fallback de curiosidade:** se em ~90s ninguém foi despertado, uma figura
  próxima levanta a cabeça e olha para a câmera. Convite sem texto.

## 8. Visualizar o que é descrito — princípio O(elementos)

Decisão: **não empacar nisso agora**; e quando voltarmos, a regra de escala é:

> **Nada por-história; tudo por-elemento.**

Produzir conteúdo visual para ~400 histórias é inviável (mesmo com IA
generativa). Mas os pontos-chave são ~20 elementos universais — o túnel, a
luz, a escuridão, a revisão de vida. **~20 vinhetas ambientais reutilizáveis**
(luz, névoa, céu, shader — não assets narrativos) disparadas pelo beat
correspondente, para qualquer história: \(O(20)\), não \(O(400)\).

A versão zero já está no doc 01 e é barata: a luz esquenta/esfria conforme o
tom do beat, a névoa recua, o céu desacelera. Começa aí; escala se merecer.

## 9. Manifesto: sem viés

Formulação do Dudu (2026-07-10), que estende o princípio 2 do doc 00:

> Como tradições que parecem sempre falar de coisas parecidas — cada uma presa
> ao próprio ponto de vista, rituais e linguajar. A experiência mapeia e
> revela **sem viés**: nós construímos o framework/canvas — organizando
> conceitos, padrões, pensamentos, histórias — e **o visitante chega às
> próprias conclusões**. Data art e tecnologia para abrir a cabeça a mais
> perguntas ou respostas.

Consequência concreta de design: sem viés = mostrar **convergência E
divergência**. Onde os relatos discordam também é dado. Um Campo que só
mostra encaixes vira propaganda; um que mostra os encaixes e as arestas
soltas vira pesquisa — e deixa o visitante genuinamente livre.

## 9.1 O Oráculo (mecânica candidata, 2026-07-10)

Ideia do Dudu: uma LLM informada em **todo o corpus** (RAG sobre o export:
transcripts, elementos, quotes, stats) que o visitante pode consultar dentro
da experiência — perguntar o que quiser e receber resposta fundamentada no
que o acervo sabe.

**A versão LIMIAR da ideia — o Oráculo responde em vozes.** Em vez de gerar
texto de chatbot, a resposta é um **Coro curado**: a pergunta vira busca
semântica (embeddings já existem no pipeline), e o Oráculo devolve *as
pessoas que falaram daquilo* — trechos de áudio reais, citações literais com
fonte, e as figuras correspondentes se iluminam no Campo, prontas para
serem visitadas. A LLM faz retrieval, ranking e no máximo uma costura
mínima; **quem responde é o corpus**.

Regras invioláveis (herdam o manifesto §9 e o req. 7 do doc 02):
1. O Oráculo **nunca afirma nada sem citação** literal validada; se o corpus
   não cobre a pergunta, ele diz "ninguém falou disso ainda" (que é, em si,
   um dado bonito).
2. Não opina, não teoriza, não console — **encontra vozes**. Bibliotecário
   do memorial, não guru.
3. UI diegética: "perguntar ao Campo" — sem cara de chat. A resposta
   acontece no mundo (pessoas iluminam, trechos tocam) + painel discreto.
4. Anti-clichê por construção: perguntou "todo mundo vê um túnel?", o
   Oráculo responde com os dados (no piloto: raro) e as vozes divergentes.

Técnica: RAG sobre `export/` (quotes + beats + stats), LLM via fal any-llm,
custo por pergunta pequeno e cacheável. Entra depois do M6 (precisa de
corpus real e busca semântica); protótipo possível como comando de debug.

## 10. Riscos de UX vigiados

1. **O vale do tédio** — platô entre a 1ª história e a gravidade ligar.
   Mitigações: limiar da gravidade mais cedo (talvez 3 histórias — calibrar
   com dados reais), micro-revelações entre marcos, e **curadoria do piloto**
   (as primeiras histórias encontráveis precisam ser diversas entre si).
2. **Kitsch** — material pesado; excesso (cordas emocionais, partículas
   douradas, slow motion) vira manipulação. A sobriedade do cinza + a voz crua
   é a proteção. Na dúvida, menos.
3. **EQMs angustiantes** — precisam estar (honestidade), com consentimento
   implícito por design: o visitante *sente* o tom antes de mergulhar
   (sussurro mais grave, cor mais fria ao longe). Sem warning label.

## 11. Impacto nos marcos (aditivo ao doc 03 §12)

| Marco | Adições deste doc |
|---|---|
| M3 | Lentes v0 via painel debug (forçar reorganização por elemento) — ✔ entregue |
| M4 | Cadeia hover/clique (§4.1: nome flutuante + semente da Sintonia + follow 3ª pessoa); timeline de hotspots; 3 níveis de profundidade (corte/íntegra/link YouTube); estados por velocidade v0 (§5.5); legenda viva v0 (§6.1) |
| M5 | Unlock de temas por escuta; regra "colher exige ouvir"; semente do Coro; onda de chegada + chegada ponderada (§5.5); fios inteligentes v0 (§5.6) |
| M6 | Lentes completas no god view (fenomenológicas §5.3 + demográficas §5.8); Coro nos núcleos/fios; palavras no espaço (§5.7); regra "números só em cima"; legenda viva premium |
| M7 | Sintonia completa; vinhetas por elemento v0 (luz/névoa/céu por tom); gesto de saída |
| pós-M6 | A Maré (§5.4) — scrub global com degradê emocional |

**Dependência transversal:** Sintonia, Coro, Lentes, Maré, timeline e resumos
consomem o mesmo insumo — beats timestampados, quotes por elemento, cortes de
áudio, embeddings, clusters, demographics. Nenhuma exige tecnologia nova no
app; todas exigem **os dados existirem**. Por isso o `acervo` (doc 02) abre
antes do M3.

# LIMIAR — A Experiência de Consumo (UX)

> **Papel deste documento:** consolida as decisões de UX da sessão de 2026-07-10
> (Dudu + agente). Estende o doc 01, resolve suas perguntas abertas (§11) e
> adiciona três mecânicas novas. Onde este doc e o 01 divergirem, **este vence**
> (é mais recente); a técnica que o serve continua no doc 03.

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

## 5. As três mecânicas novas (batizadas em 2026-07-10)

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

## 6. O loop de descoberta (fechado)

```
escutar → desbloquear tema → aplicar lente → o Campo se reorganiza
   ↑                                                    ↓
   ←── novas histórias a escutar ←── novas conexões visíveis
```

Cada volta aprofunda o quebra-cabeça: é como desvendar algo que se encaixa
cada vez mais — verdades que parecem as mesmas, contadas com palavras,
interpretações e backgrounds diferentes.

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
| M3 | Lentes v0 via painel debug (forçar reorganização por elemento) |
| M4 | Timeline de beats no follow; 3 níveis de profundidade (corte/íntegra/link YouTube); semente da Sintonia |
| M5 | Unlock de temas por escuta; regra "colher exige ouvir"; semente do Coro |
| M6 | Lentes completas no god view; Coro nos núcleos/fios; regra "números só em cima" |
| M7 | Sintonia completa; vinhetas por elemento v0 (luz/névoa/céu por tom); gesto de saída |

**Dependência transversal:** Sintonia, Coro, Lentes, timeline e resumos
consomem o mesmo insumo — beats timestampados, quotes por elemento, cortes de
áudio, embeddings, clusters. Nenhuma exige tecnologia nova no app; todas
exigem **os dados existirem**. Por isso o `acervo` (doc 02) abre antes do M3.

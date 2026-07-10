# LIMIAR — Conceito da Experiência

> Este é o documento de design. Ele descreve o que o visitante vive, na ordem em que vive. O doc 03 traduz isto em arquitetura técnica. Quando os dois conflitarem, este vence — a técnica serve a experiência.

---

## 1. Logline

Em uma planície enevoada entre a vida e o que vem depois, centenas de pessoas caminham. Cada uma carrega uma história real de quase-morte. Aproxime-se, escute — e veja o campo inteiro se reorganizar conforme você compreende o que as conecta.

## 2. A fantasia central

O visitante é um **pesquisador-peregrino**. Não há avatar visível, não há pontuação na tela, não há tutorial com texto. Há um lugar, uma multidão, e curiosidade. A progressão inteira é epistemológica: o que muda ao longo da experiência não é o poder do jogador — é o quanto ele *entende*. E o mundo reflete esse entendimento fisicamente: quanto mais você sabe, mais organizado, conectado e luminoso o Campo se torna.

É a sensação de estar num arquivo vivo. Como caminhar por um memorial onde as lápides andam, respiram e, se você parar para ouvir, falam com você na própria voz.

## 3. O mundo: o Campo

Uma planície vasta, sem paredes, sob um céu de ruído cinza em movimento lento (herança direta do céu FBM do patch — ele já tem o tom certo). Névoa no horizonte esconde os limites: o mundo parece infinito, mas a simulação o mantém contido (o "Distance Check" do patch vira poesia — as pessoas simplesmente não vão além de certo ponto, como se algo as mantivesse ali).

O Campo é um **espaço liminar**: não é o mundo dos vivos nem o "outro lado" — é o limiar entre eles, o lugar onde essas histórias existem suspensas. Isso resolve elegantemente a pergunta "onde estamos?": estamos no entre.

**A luz é significado.** O Campo começa em penumbra suave. Pessoas cujas histórias ainda não foram ouvidas são figuras cinzentas, quase silhuetas. Ao serem ativadas, ganham sua cor — e a cor não é decorativa: é a assinatura de dados da pessoa (derivada do seu cluster dominante). Um Campo muito explorado é visivelmente mais colorido e vivo que um Campo virgem. O progresso do visitante é legível de longe, sem nenhuma UI.

## 4. As pessoas

Cada figura no Campo é um depoimento real do canal. A figura low-poly de 256 vértices do patch é perfeita para isso: anônima o suficiente para ser qualquer um, humana o suficiente para importar.

O insight fundador do projeto (e ele já estava no patch antes de ser formulado): **as animações são a máquina de estados da narrativa.** Cada pose/clipe assado no VAT corresponde a um estado da história:

| Estado narrativo | Animação (VAT) | Quando acontece |
|---|---|---|
| **Dormente** | Idle (parada, respirando) | História ainda não descoberta. A figura é cinza, emite um sussurro espacial ininteligível ao se aproximar. |
| **Testemunho** | Caminhada (loop) | A história está sendo contada. A pessoa caminha com propósito e você a segue. |
| **A morte** | Queda (one-shot) | No timestamp exato em que o relato chega ao momento da morte, a figura cai. |
| **O limiar** | No chão (hold no último frame da queda) | Durante a descrição da EQM em si. O corpo fica; a voz continua. É o momento mais poderoso da experiência: você olha para alguém caído ouvindo-o descrever o que viu do outro lado. |
| **O retorno** | Levantar | Quando o relato descreve a volta à vida. |
| **Integração** | Ajoelhar / rezar (loop sutil) | O depois: a transformação, o que a pessoa trouxe de volta. Ao final, a pessoa permanece no Campo em seu novo estado — ativada, colorida, conectada. |

Os 6 slots de "Posed Animations" do patch mapeiam exatamente para esse vocabulário. O que era um slider vira dramaturgia.

## 5. A jornada — em atos

### Ato 0 — Chegada
Fade in do branco (não do preto — nasce-se para o Campo, não se acorda nele). Névoa, céu em movimento, a multidão ao longe vagando sem direção. Nenhuma UI. Um texto curto e único de contexto (o disclaimer ético, transformado em tom): *"Tudo o que você vai ouvir aqui foi contado por pessoas reais."* Depois, silêncio e liberdade. O visitante vaga. Ao se aproximar de figuras cinzentas, ouve sussurros posicionais — fragmentos murmurados dos próprios depoimentos, baixos demais para entender (isto resgata e justifica os experimentos `whisper.mp3` abandonados no patch). O design aposta que curiosidade basta: alguém vai chegar perto o suficiente de alguém.

### Ato 1 — A primeira história
Aproximar-se o bastante de uma pessoa dormente (ou clicar nela) a desperta. A câmera se acopla suavemente (modo follow), a figura começa a caminhar, e a voz real do depoimento entra. A partir daqui, os **beats** do relato dirigem o mundo:
- No beat da morte, a figura cai. Sugestão de cena: por dois segundos, *todas* as pessoas do Campo param de andar. Um instante coletivo de silêncio. Depois retomam. (Custo técnico: trivial. Custo emocional: enorme.)
- Durante o beat da EQM, o mundo muda sutilmente — a luz esquenta ou esfria conforme o tom do relato (paz vs. angústia), a névoa recua, o céu desacelera.
- No retorno, a figura se levanta. Na integração, ajoelha. Ao final, ganha sua cor definitiva.
Ao término, o primeiro **elemento** colhido se revela (ex.: *"o túnel"*) — e com ele, o primeiro vislumbre de que há um sistema: fios tênues de luz se acendem por um momento, ligando essa pessoa a outras silhuetas distantes que compartilham o elemento. Convite silencioso: *elas também viram isso.*

### Ato 2 — O léxico
Os elementos colhidos formam o **Diário** do visitante (a única UI persistente, invocável, discreta — pensada como um caderno de campo). Cada elemento novo:
- Acende permanentemente os fios entre pessoas ativadas que o compartilham.
- Faz pessoas dormentes que o contêm sussurrarem um pouco mais alto quando você passa (o mundo começa a te chamar).
Escolher quem seguir deixa de ser aleatório e vira decisão informada: *"quero entender melhor a revisão de vida — vou atrás de quem a menciona."* Filtrar por elemento (no Diário) faz as pessoas correspondentes pulsarem suavemente no Campo.

### Ato 3 — A gravidade
A partir de um limiar de descoberta (ex.: 5 histórias completas ou 8 elementos), a **gravidade semântica** liga: as pessoas ativadas começam a migrar lentamente para suas posições de cluster (o layout UMAP calculado pelo pipeline). Núcleos se formam diante do visitante — e ganham nome quando ele os visita: *"Os que atravessaram o túnel"*, *"Os que escolheram voltar"*, *"Os que não queriam voltar"*, *"As experiências difíceis"*. A reorganização é lenta e contínua, nunca um teleporte: o Campo é um organismo se ordenando, não um gráfico dando refresh. Pessoas dormentes só migram quando ativadas — o mapa completo exige o trabalho completo.

### Ato 4 — A constelação
Um gesto (scroll longo para fora / tecla) inicia a **troca de escala**: a câmera sobe, as figuras encolhem até virarem pontos de luz, os fios ganham protagonismo — a multidão se torna um grafo vivo, uma via-láctea de histórias. Aqui vive a camada estatística, apresentada com sobriedade: co-ocorrências ("dos que viram a luz, 8 em cada 10 relatam paz imediata"), tamanhos de núcleo, os elementos mais raros. Tudo clicável: tocar um ponto e descer de volta re-humaniza o dado — a estrela vira gente de novo, e é *aquela* pessoa, com *aquela* voz. Essa ida-e-volta entre escalas é a tese do projeto em forma de mecânica (princípio 3 do doc 00).

### Ato ∞ — O arquivo vivo
Não há tela de fim. Quando o canal publica um vídeo novo e o pipeline roda, uma pessoa nova chega ao Campo — literalmente caminhando de dentro da névoa do horizonte. Visitantes recorrentes encontram o Campo maior do que deixaram. (Progresso pessoal persiste localmente.)

## 6. Verbos do visitante

Vagar · aproximar · escutar · despertar (clicar/chegar perto) · seguir · colher (elementos) · consultar (Diário) · filtrar · alternar escala · marcar (favoritar pessoas para revisitar).

Nenhum verbo de violência, coleta de recurso ou otimização. O "jogo" é inteiramente de atenção e curiosidade.

## 7. O sistema de elementos

Duas camadas (espelhando o pipeline, doc 02):
- **Elementos canônicos** (~18–24): a taxonomia baseada na literatura de EQM (escala de Greyson, categorias NDERF) traduzida para PT. São os colecionáveis principais. Incluem obrigatoriamente `eqm_angustiante` — a honestidade de mostrar experiências difíceis diferencia o projeto de propaganda.
- **Motivos emergentes**: padrões que o próprio corpus revelar (coisas ditas repetidamente que a literatura não cataloga). Na experiência, aparecem como descobertas raras/especiais — o visitante encontrando algo que *nem a ciência nomeou ainda*. É o momento de recompensa mais alto do jogo de descoberta.

Colher um elemento exige ter *ouvido* o trecho onde ele aparece (não basta ativar a pessoa e sair). Isso protege o coração do projeto: não dá para minerar o Campo sem escutar as pessoas.

## 8. Som

- **Sussurros posicionais** (dormentes): fragmentos reais murmurados, spatial audio, raio curto.
- **Voz do testemunho** (follow): o áudio real do vídeo, cortado por beats pelo pipeline, com loudness normalizado.
- **Cama generativa**: textura sonora contínua e discreta que reage ao estado do mundo — densidade de pessoas próximas, proporção de ativados, modo constelação. Nunca "música" reconhecível; mais um vento harmônico.
- **Sons de sistema diegéticos**: colher um elemento, acender um fio, formar um núcleo — cada um com uma assinatura sutil (sinos distantes, não "plim" de UI).

## 9. Direção estética

Liminal, contemplativo, sereno. A morte tratada como passagem relatada, nunca como horror ou espetáculo. Paleta: cinzas quentes e névoa como base; a cor existe apenas como dado conquistado (pessoas ativadas, fios, núcleos). Referências de tom: *Journey* (travessia, anonimato, comunicação sem palavras), *Everything* (troca de escalas como epifania), as obras de dados de Refik Anadol (dado como matéria estética) — e o próprio patch cables, cujo céu cinza e figuras já acertaram a atmosfera na primeira tentativa.

## 10. Plataforma e formatos

- **Primário:** web (desktop com WebGPU; fallback WebGL2 com multidão reduzida; mobile como versão contemplativa reduzida).
- **Futuro possível:** modo instalação (fullscreen, attract mode, ciclo autônomo quando ninguém interage — a multidão vive sozinha) para exposições/festivais; VR como horizonte distante (o Campo em escala humana real).

## 11. Perguntas em aberto (decidir juntos, de preferência após a Fase A)

1. **Grau de gamificação:** só descoberta livre, ou metas suaves ("núcleos completados", conquistas)? Instinto atual: livre, com o Diário como única estrutura.
2. **Duração de uma história no follow:** depoimentos podem ter 20–60 min. Usar cortes editados por beats (5–10 min por pessoa) com opção "ouvir na íntegra"? (O pipeline já exporta os cortes; a decisão é de design.)
3. **Onboarding:** zero texto vs. o texto único de contexto do Ato 0. 
4. **Idioma:** PT nativo; legendas EN para alcance internacional (o pipeline já gera transcrições — legendar é barato).
5. **Nome final.**

## 12. Nomes candidatos

**LIMIAR** (atual — o espaço entre; curto, forte em PT e legível em EN) · **TRAVESSIA** · **O CAMPO** · **ENTRE** · **DO OUTRO LADO** · **AFINAL** (homenagem direta ao canal — usar apenas com parceria formalizada).

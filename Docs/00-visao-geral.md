# LIMIAR — Visão Geral do Projeto

> **Codinome provisório.** Outras opções de nome estão no final do doc 01. Substitua "LIMIAR" globalmente quando decidir.

**One-liner:** Uma experiência interativa em tempo real onde centenas de relatos reais de experiências de quase-morte (EQM / NDE) tomam forma como uma multidão viva — e o visitante descobre, história por história, os padrões que conectam todas elas.

---

## 1. O que é

LIMIAR é um híbrido de **visualização de dados, arte generativa e jogo de descoberta**. O material bruto são os depoimentos em vídeo do canal *"Afinal, o que somos nós?"* (YouTube): pessoas contando, em primeira pessoa, suas experiências de quase-morte.

Cada depoimento vira **uma pessoa** dentro de um mundo 3D — uma figura low-poly que vagueia por uma planície enevoada junto com centenas de outras. O visitante pode se aproximar, escutar, seguir uma pessoa enquanto sua história é contada com a voz real do depoimento. Conforme escuta mais histórias, ele coleta os **elementos** recorrentes (o túnel, a luz, a revisão de vida, o encontro com parentes falecidos...) e o mundo se reorganiza diante dele: pessoas com histórias afins gravitam umas às outras, formando núcleos visíveis. O que começa como uma multidão caótica termina como um mapa vivo do que essas experiências têm em comum.

O projeto nasceu de um patch funcional no cables.gl (simulação de multidão 100% GPU com Vertex Animation Textures) que já provou a viabilidade técnica do medium. Agora ele se desdobra em duas frentes: uma **ferramenta de dados** que transforma o canal em um acervo estruturado, e a **experiência** em si, reconstruída em React Three Fiber + WebGPU.

## 2. Os três pilares

**O Acervo (pilar de dados).** Pipeline automatizado que baixa, transcreve, analisa e estrutura todos os depoimentos do canal em um formato padronizado. É o que alimenta tudo. → Documento 02.

**O Campo (pilar da experiência).** O mundo 3D em tempo real: a multidão, a simulação, a atmosfera, o áudio. → Documentos 01 (conceito) e 03 (técnico).

**A Descoberta (pilar de jogo).** A camada que transforma dados em jornada: seguir, colher elementos, revelar conexões, ver os núcleos emergirem. É o que diferencia LIMIAR de um dashboard bonito. → Documento 01.

## 3. Princípios norteadores

Estes princípios resolvem discussões futuras. Quando houver dúvida de design, volte aqui.

1. **Cada ponto é uma pessoa.** Nunca reduzir os relatos a estatística fria. A escala estatística só existe porque cada unidade é um ser humano real com voz real. O design deve sempre permitir voltar do agregado para o indivíduo.
2. **O mistério como espaço, não como resposta.** A experiência apresenta as convergências dos relatos com honestidade e deixa o visitante chegar às próprias conclusões. Ela *evoca* a possibilidade de algo além, mas não argumenta uma tese. As duas leituras (transcendente e neurocientífica) podem coexistir dentro dela — isso a torna mais forte, não mais fraca.
3. **Duas escalas, uma verdade.** A escala íntima (seguir uma pessoa, ouvir sua voz) e a escala estatística (a constelação, os clusters, os números) são o mesmo dado visto de distâncias diferentes. A transição entre elas é um momento central da experiência.
4. **Arquivo vivo.** O canal continua publicando; o Campo continua crescendo. Novas pessoas chegam caminhando do horizonte. Nada é hardcoded — tudo é alimentado por conteúdo versionado.
5. **Dados honestos, curadoria que evoca.** A ferramenta de dados nunca inventa: toda citação vem literal do transcript, todo elemento tem confiança e revisão humana. A poesia está na apresentação, não na manipulação.
6. **Respeito em primeiro lugar.** São relatos sobre morte, luto e transformação, de pessoas reais. Tom contemplativo, nunca mórbido nem sensacionalista. Ver seção 4.

## 4. Ética e direitos (ler antes de escalar)

- **Permissão do canal.** O corpus completo só deve ser processado e publicado com autorização/parceria do criador do canal *"Afinal, o que somos nós?"*. Para prototipagem interna, usar um corpus piloto pequeno (10–20 vídeos públicos) é razoável; para lançar, a parceria é o caminho — e provavelmente bem-vinda, já que o projeto valoriza o trabalho do canal e dá crédito.
- **Dignidade dos depoentes.** Opção de anonimização por pessoa (nome ocultável no schema). Nenhum dado além do que a própria pessoa tornou público no vídeo. Canal de contato para remoção caso alguém (ou família) solicite.
- **Sem alegações médicas ou científicas.** A experiência mostra padrões em relatos; não afirma causas nem promete nada. Um texto curto de contexto na entrada resolve isso com elegância.
- **EQMs angustiantes existem.** Uma parcela dos relatos é de experiências difíceis/aterrorizantes. Incluí-las (com cuidado) é parte da honestidade do princípio 5.

## 5. Mapa dos documentos

| Doc | Nome | O que é | Quem consome |
|---|---|---|---|
| 00 | Visão Geral | Este documento. Norte do projeto. | Você + qualquer IA/pessoa que entre no projeto |
| 01 | Conceito da Experiência | O design completo: mundo, jornada, mecânicas, estética, som | Você (design) + informa o doc 03 |
| 02 | Briefing — Pipeline de Dados | Especificação para construir a ferramenta "acervo" | Claude Code / Cursor (repo 1) |
| 03 | Briefing — Experiência 3D | Especificação para construir o mundo em R3F + WebGPU | Claude Code / Cursor (repo 2) |

**Como usar com Claude Code / Cursor:**
1. Crie dois repositórios: `acervo/` (pipeline) e `limiar-experience/` (experiência).
2. Em cada repo, crie uma pasta `docs/` e coloque o doc 00 + o briefing correspondente (02 ou 03). O doc 01 vai nos dois.
3. Crie um `CLAUDE.md` (ou `.cursorrules`) na raiz de cada repo dizendo: *"Leia docs/00 e docs/0X antes de qualquer tarefa. Implemente por marcos (milestones), um de cada vez, com commit ao final de cada marco. Nunca avance para o próximo marco sem os critérios de aceite do atual passarem."*
4. Trabalhe um marco por sessão. Os briefings foram escritos para isso: cada marco tem critérios de aceite verificáveis.

## 6. Roadmap macro

- **Fase A — Acervo v1 (piloto).** Pipeline funcionando de ponta a ponta com 10–20 vídeos. Sai daqui: dados reais para descobrir o que o corpus *realmente* diz (isso informa o design).
- **Fase B — Protótipo do Campo.** Port do VAT + simulação com evitação + instancing em R3F/WebGPU. Primeiro com dados fake, depois plugando o export da Fase A.
- **Fase C — Integração íntima.** Modo follow com áudio real sincronizado aos estados (queda na morte, levantar no retorno). A primeira história completa vivenciável é o marco emocional do projeto.
- **Fase D — Descoberta completa.** Elementos, fios, gravidade progressiva, constelação.
- **Fase E — Corpus completo + polimento + publicação.** Com parceria do canal formalizada.

A ordem A→B é intencional: **os dados informam o design**. Os clusters que emergirem do corpus real podem mudar decisões da experiência (quantos núcleos, quais elementos são raros vs. universais, duração média das histórias).

## 7. Glossário

- **EQM / NDE** — Experiência de Quase-Morte (Near-Death Experience).
- **Pessoa** — um depoimento do canal, representado como uma figura no Campo. No código, mapeada a um *agente* da simulação.
- **O Campo** — o mundo 3D: a planície liminar onde a multidão existe.
- **Elemento** — um componente recorrente das EQMs, da taxonomia canônica (ex.: `tunel`, `revisao_de_vida`). Colecionável pelo visitante.
- **Motivo emergente** — padrão descoberto no corpus que ainda não está na taxonomia canônica.
- **Beat** — um trecho com timestamps de um depoimento, classificado por fase narrativa (contexto → morte → EQM → retorno → integração). Dirige os estados de animação.
- **Núcleo / cluster** — agrupamento de pessoas por similaridade semântica das histórias.
- **Fio** — aresta visível entre duas pessoas que compartilham elementos; revelado conforme o visitante descobre.
- **VAT** — Vertex Animation Texture: animação assada em textura, lida no vertex shader (técnica herdada do patch cables).
- **Constelação** — o modo de visão estatística: a multidão vista de cima como grafo de pontos e fios.

# 06 — Guia dos estados de animação (o painel, explicado)

> **Papel deste documento:** manual de uso dos controles de animação da
> multidão e do personagem (pedido do Dudu, 2026-07-13: "não entendo muito
> como usar ainda"). O design por trás está no doc 04 §5.5; a técnica no
> doc 03 §14.4. Este doc explica **o que cada parâmetro faz, como misturar,
> e receitas prontas**. Os nomes citados são os do painel (em inglês desde
> 2026-07-13).

---

## 1. O modelo mental (leia isto primeiro)

Ninguém "escolhe" a animação de um agente diretamente. O sistema tem
**duas camadas**, e entender isso resolve 90% da confusão:

```
FÍSICA (simulação)          →  ESTADO (máquina por agente)  →  CLIPE (VAT)
velocidade real, distância      idle / walking / running        idle, walk,
ao alvo, sorteio pessoal        settled-idle / praying          pray…
```

1. **A simulação move os corpos** (wander, separação, gravidade dos dados,
   mouse). Ela produz DUAS medidas por agente: a **velocidade real** e a
   **distância ao alvo** (quando há gravidade/lente ativa).
2. **A máquina de estados lê essas medidas** e decide o estado de cada
   agente: parado, andando, correndo, assentado ou rezando.
3. **Cada estado toca um clipe da VAT** (com crossfade suave na troca).

> **Consequência prática:** para "fazer todo mundo correr", você não liga
> um botão "correr" — você faz a física empurrar os corpos acima do limiar
> de corrida (mais `max speed`, alvo mais longe, mais `gravity force`).
> A animação é um **termômetro da simulação**, não uma coreografia.
> (Princípio do doc 04 §5.5.)

### Os dois grupos de "States" do painel

| Grupo | O que é | Quando usar |
|---|---|---|
| **States (per agent)** | A máquina automática acima — cada agente no seu estado, dirigido pela física | O modo normal da experiência (M3.6+) |
| **States (seamless morph)** | Botões GLOBAIS: um clique põe **todos** os agentes (e o personagem) no mesmo clipe, morfando suave | Debug, conferir um clipe novo do Studio, screenshots |

O toggle **`automatic states`** (em States (per agent)) escolhe quem manda:
ligado = máquina automática; desligado = os botões globais voltam a valer.
Os dois nunca brigam — é um ou outro.

---

## 2. Os cinco estados e o que dispara cada um

| Estado | Clipe tocado | O que dispara |
|---|---|---|
| **idle** (parado) | `idle` (ou variação `idle 2`, sorteio estável ~35%) | velocidade < `v0` |
| **walking** | `walk` | velocidade entre `v0` e `v1` |
| **running** | `walk` acelerado 1,35× (ou clipe `run` real, se a VAT tiver) | velocidade > `v1` |
| **settled-idle** (assentado) | `idle` | chegou ao alvo (gravidade/lente ativa), parou perto dele |
| **praying** (rezando) | `pray` | idem assentado, mas o **sorteio pessoal** caiu em rezar |

Detalhes que valem saber:

- **O sorteio de rezar é estável por agente** (semente = índice): a mesma
  pessoa sempre faz a mesma escolha ao chegar — nada de pisca-pisca.
  Quem tem o elemento `transformacao` no relato tem **peso 2×** para rezar
  (o dado escolhe o gesto — doc 04 §5.5).
- **Assentar exige três coisas ao mesmo tempo**: alvo ativo (gravidade OU
  lente ligada), estar perto dele, e estar devagar. Sem gravidade/lente,
  ninguém "assenta" — ficam em idle/walk/run pelo wander.
- **Running sem clipe próprio**: a VAT legada não tem corrida — o estado
  "correndo" toca o walk com playback 1,35× (`runBoost`). Quando o VAT
  Studio assar um clipe com "run"/"corr" no nome, ele é usado
  automaticamente e o boost desliga sozinho (`clipRoles.ts` detecta).

### Como os clipes são encontrados (importante para o VAT Studio)

A **precedência** é: dropdown do grupo Vocabulary (painel) > `role`
declarado no descriptor (dropdown "papel" no VAT Studio) > **NOME do
clipe** (regex pt/en, case-insensitive):

| Papel | Regex de detecção | Fallback se não achar |
|---|---|---|
| idle | `/idle\|parad/` | primeiro clipe em loop |
| idle 2 (variação) | segunda ocorrência de `/idle\|parad/` | = idle |
| walk | `/andar\|walk\|caminh/` | = idle |
| run | `/corr\|run/` | = walk (com boost 1,35×) |
| pray | `/rez\|pray\|ajoelh\|kneel/` | = idle |

> **Receita no Studio:** marque o papel no dropdown da linha do clipe (ou
> apenas nomeie com essas palavras — "Idle", "Walk", "Run", "Pray") e a
> máquina de estados o adota sem tocar em código. Clipes extras (dança,
> morrer, levantar) ficam acessíveis pelos botões de States (seamless
> morph), pelos one-shots do M4 e pelas regras do Vocabulary (abaixo).

---

## Vocabulary — o guarda-roupa de animações (M4b)

O grupo **Vocabulary** do painel deixa remapear os papéis e ligar clipes
aos DADOS sem tocar em código:

- **5 dropdowns de papel** (`idle`, `idle 2`, `walk`, `run`, `pray`) com
  TODOS os clipes carregados (`?vat=` e `?vatB=` juntos, rótulo
  `textura · clipe`). Default `auto` = a detecção acima. Escolher um clipe
  de outra textura funciona: os índices são globais (A ++ B).
- **`idle playback ×` / `settle playback ×`** — velocidade do clipe nos
  estados parado e assentado/rezando (0,3–2×). `run boost ×` é o playback
  extra do walk no estado correndo — ignorado quando run tem clipe próprio
  (≠ walk).
- **2 regras `elemento → clipe (peso)`** — a liberdade dos dados: quem TEM
  o elemento entra no sorteio de assentamento com o clipe designado.
  Exemplos: `transformacao → rezar` com peso 2 (dobra a chance de ajoelhar);
  `fora_do_corpo → <gesto da vatB>` com peso 3. Peso 0 = regra inerte.

> **Técnica (mudou no M4b):** o sorteio do gesto de chegada saiu do shader
> e mora na CPU (`agentMapping.computeAgentMeta` → `meta.y`: −1 = idle
> próprio, ≥0 = índice global do clipe-gesto). Estável por agente (a mesma
> pessoa sempre escolhe igual), e regras novas nunca mais tocam a GPU.

---

## 3. Parâmetro por parâmetro — States (per agent)

### Limiares de locomoção (o coração do sistema)

| Controle | Default | O que faz |
|---|---|---|
| `v0 idle⇄walk` | 0.12 | Velocidade (unidades/s) abaixo da qual o agente é "parado". **Subir** = mais gente parada; **descer** = todo mundo anda o tempo todo |
| `v1 walk⇄run` | 1.15 | Velocidade acima da qual vira corrida. **Subir** = correr fica raro/especial; **descer** = multidão nervosa |
| `hysteresis (±)` | 0.12 | Margem anti-flicker (±12%): ENTRAR num estado exige passar o limiar com folga; FICAR é mais barato. Se agentes "gaguejam" entre andar/correr na fronteira, suba isto |
| `crossfade (s)` | 0.3 | Duração do morph entre clipes na troca de estado. Curto = resposta rápida (bom p/ debug); longo = transição contemplativa |

Há também um **dwell interno de 0,35 s** (tempo mínimo em cada estado, não
exposto no painel) — mesmo com histerese zero ninguém troca de estado duas
vezes no mesmo segundo.

> **Regra de bolso:** `v0` e `v1` só fazem sentido RELATIVOS ao
> `max speed` do grupo Simulation. Com `max speed` 0.8 (default), `v1`
> 1.15 é quase inalcançável no wander puro — correr só acontece na
> **onda de chegada** (abaixo). É de propósito: correr = chamado forte.

### Chegada e assentamento

| Controle | Default | O que faz |
|---|---|---|
| `settle: idle weight` | 1 | Peso do sorteio "assentar em idle" |
| `settle: pray weight` | 0.6 | Peso do sorteio "assentar rezando". A fração que reza ≈ pray/(idle+pray) — defaults ⇒ ~38% (e 2× disso p/ quem tem `transformacao`) |
| `arrival wave` | 0.9 | **Onda de chegada**: quem está LONGE do alvo ganha teto de velocidade extra (corre para alcançar); quem está perto assenta primeiro. 0 = todos chegam no mesmo passo (formação lenta e monótona); alto = corrida dramática dos retardatários |

> **Só têm efeito com alvo ativo** (gravidade UMAP ligada ou uma lente
> escolhida no grupo Data (M3) / Demographic lens). Sem alvo, não há
> "chegada".

### Vida sem gravidade (o Campo em repouso)

| Controle | Default | Chave | O que faz |
|---|---|---|---|
| `wander pauses` (Dormants) | 0.45 | `pausas` | Pausa orgânica por agente; desliga com seek (formação/migração) |
| `wander pauses` (Witnesses) | 0.2 | `Witnesses.pausas` | Idem nas testemunhas; desliga enquanto migra |
| `speed variance` (Dormants) | 0.25 | — | Teto de velocidade por agente: 0 = uniforme; 1 = ±100% do `speed ×` |
| `speed variance` (Witnesses) | 0.2 | — | Idem nas testemunhas |
| `wander variance` (Dormants) | 0.25 | — | Força do curl por agente |
| `wander variance` (Witnesses) | 0.15 | — | Idem nas testemunhas |
| `speed ×` (Dormants) | 0.7 | — | × `max speed` dos dormentes |
| `speed ×` (Witnesses) | 1 | — | × `max speed` das testemunhas |

### O que NÃO está neste grupo mas muda tudo

| Onde | Controle | Efeito nos estados |
|---|---|---|
| Simulation | `max speed` | Teto geral — decide se `v1` é alcançável |
| Simulation | `max speed` | Teto de velocidade global |
| Witnesses | `wander weight` / `speed ×` | Vontade própria e ritmo das testemunhas |
| Dormants | `wander weight` / `speed ×` / `wander variance` / `speed variance` / `wander pauses` | Ritmo e vida dos dormentes |
| Witnesses | `wander weight` / `speed ×` / `wander variance` / `speed variance` / `wander pauses` / `pause on hover` | Ritmo e vida das testemunhas (pausas off na migração; hover freeze facilita clique) |
| Simulation | `stride/unit` | Frames de walk por unidade andada (pés não patinam). Não muda ESTADO, muda a cadência visual do passo |
| Simulation | `debug color` → `state` | **A ferramenta de leitura**: pinta cada agente pelo estado (cinza=idle, verde=walk, laranja=run, azul=settled, roxo=pray). Ligue isto sempre que for calibrar |
| Data (M3) | `gravity (UMAP)` / `lens` | Sem um dos dois, não existe assentar/rezar |
| Data (M3) | `gravity force` | Força do puxão = velocidade na viagem = quem corre |

---

## 4. Receitas prontas

**"Quero ver a máquina funcionando" (setup de calibração)**
1. Simulation → `debug color` = `state`
2. Data (M3) → `gravity (UMAP)` ON
3. Observe: verde/laranja a caminho, azul/roxo nos núcleos, cinza vagando.

**Multidão mais contemplativa (menos agito)**
- `wander pauses` 0.6–0.75 · Simulation `max speed` 0.5–0.6 ·
  `crossfade` 0.5 · `dormant: speed ×` 0.5

**Chegada épica (formação de núcleo dramática)**
- `arrival wave` 2–3 · `v1` 0.9 (corrida mais fácil) ·
  Data (M3) `gravity force` 3–4 → os de longe DISPARAM enquanto o miolo
  já assentou. Cuidado com o teste do §1.1 do doc 04 (organismo, não ruído).

**Todo mundo reza ao chegar**
- `settle: idle weight` 0 · `settle: pray weight` 4 → 100% reza
  (o inverso — pray 0 — ninguém reza nunca).

**Ninguém corre nunca (Campo sereno)**
- `v1` = 3 (máximo) → correr fica inalcançável mesmo na onda.

**Voltar ao comportamento antigo (pré-M3.6)**
- `automatic states` OFF → botões de States (seamless morph) mandam de
  novo em todo mundo ao mesmo tempo. Na URL: `?estados=0`.

**Testar um clipe recém-assado no Studio**
- `automatic states` OFF → clique o clipe em States (seamless morph)
  (a multidão inteira toca ele — qualquer defeito salta aos olhos).
  Depois ligue o auto de novo e confira se o papel foi detectado (nome!).

---

## 5. Persistência, URL e sondas

- **Tudo acima persiste** pelo grupo Preferences (`save as default`) e
  entra no `tuning.json` de export/import.
- **Query params** (vencem o salvo — URLs reproduzíveis):
  `?estados=0` (auto off) · `?v0=` `?v1=` (limiares) · `?onda=` (wave) ·
  `?pausas=` (pauses) · `?gravity=1` · `?lens=<elemento>` ·
  `?dlens=<lente>` · `?debug=estado` (cor por estado).
- **Sonda headless**: `node scripts/states-probe.mjs "<url>"` imprime o
  histograma de estados via readback GPU (no WebGL2 usar `&labels=0`).

## 6. Nota da tradução do painel (2026-07-13)

O painel de debug (leva) fala **inglês** desde 2026-07-13 (pedido do
Dudu). O que mudou e o que não mudou:

- **Mudou:** nomes dos grupos e labels visíveis (Multidão→Crowd,
  Simulação→Simulation, Estados (por agente)→States (per agent),
  Dados (M3)→Data (M3), Aparência→Appearance, Preferências→Preferences,
  Cena→Scene, Personagem→Character, Lente demográfica→Demographic lens).
- **Não mudou:** keys internas dos controles, **query params** (`?lens=`,
  `?estados=`…), valores internos dos dropdowns (`atrair`, `multidao`…,
  que agora aparecem com rótulo EN mas gravam o mesmo valor) e as keys da
  taxonomia (dados em PT — a UI real da experiência, Legend, segue PT).
- **Preferências salvas migram sozinhas**: blobs antigos (localStorage ou
  `tuning.json`) com paths PT são re-escritos na leitura
  (`src/lib/prefs.ts`, `GROUP_RENAMES`) — nada se perde.

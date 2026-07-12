# LIMIAR — instruções para agentes

Leia antes de qualquer tarefa, nesta ordem:

1. `docs/00-visao-geral.md` — norte do projeto, princípios, ética
2. `docs/01-conceito-experiencia.md` — o design que este código serve (em conflito com a técnica, ele vence)
3. `docs/04-experiencia-consumo.md` — decisões de UX mais recentes (estende e vence o 01 em conflito)
4. `docs/03-briefing-experiencia-3d.md` — arquitetura, stack e marcos (M0–M7) **incluindo a errata no §1**
5. `docs/ANALISE_TECNICA.md` — engenharia reversa do patch cables.gl original (fatos verificados)

## Método de trabalho

- Implemente **por marcos** (docs/03 §12), um por vez. Não avance sem os critérios de aceite do marco atual passarem.
- Commit ao final de cada marco, com tag (`m0`, `m1`, …).
- Todo TSL fica encapsulado em `src/vat/` e `src/sim/` — o resto do app não importa `three/tsl` diretamente.
- Nada de conteúdo hardcoded (histórias, cores, posições): tudo virá de `content/` (contrato no doc 02 §10 do repo do pipeline).

## Fatos técnicos verificados (não re-derivar)

- Malha do personagem: **1590 vértices** (530 triângulos, soup sem índices, sem UVs).
- VAT `public/vat/anim_{positions,normals}_360f.exr`: 1590×360 float, **6 clipes × 60 frames**;
  clipes: 0 idle · 1 andar · 2 idle var. · 3 morrer (one-shot) · 4 levantar (one-shot) · 5 rezar.
- Conversão de espaço: `pos = basis("x_negz_y") × (raw − bakeOffset)` — ver `src/vat/descriptor.ts`.
- Normais assadas como **vetores unitários crus em [-1,1]** (sem offset/encode): decode = basis + normalize.
- Playback de paridade com o patch: ~18 fps (60 frames em ~3,33 s).
- Crossfade entre clipes: dois slots (A/B) amostrados no shader, mix por `blend`;
  fase por instância só em loops (`phaseScale=0` em one-shots → beats síncronos).
- Multidão: InstancedMesh + InstancedBufferAttribute em BufferGeometry comum;
  `instanceMatrix` fica em identidade (transform real vem da sim + atributos);
  `mesh.count` controla quantas instâncias desenham (máx. 64×64 = 4096).
- **WebGPU limita a 8 vertex buffers por pipeline**: por isso a soup NÃO tem
  atributo de normal (vem da VAT) e cor+escala compartilham um vec4
  (`iColorScale`). Cuidado ao adicionar novos atributos por instância —
  prefira storage buffers da sim.
- Simulação (`src/sim/CrowdSim.ts`): storage buffers (`instancedArray`) de
  posição/velocidade/direção/fase; render lê via `.toAttribute()` (compatível
  com WebGL2). Separação é O(N²) com `Loop` — só roda no backend WebGPU
  (transform feedback não tem acesso aleatório a buffers); hash grid espacial
  é o upgrade planejado para >4096 agentes.
- **Transform feedback (compute WebGL2) tem teto de 4 varyings** — TODA
  leitura de storage num pass TF vira attribute+varying no GLSLNodeBuilder,
  mesmo sem escrita. Os 4 slots já estão tomados (pos/vel/heading/phase);
  buffer novo lido pelo compute (ex.: targets do M3) entra como
  **DataTexture + textureLoad** no pass sem separação (mesmo Float32Array
  espelhado nos dois recursos; `commitTargets()` marca os dois).
- **Storage buffer lido no VERTEX stage do render**: WebGPU permite direto
  (acesso vira read-only automaticamente); WebGL2 exige `.setPBO(true)` no
  nó `storage()` — o backend copia o buffer TF para uma DataTexture após
  cada compute e o vertex shader lê via texelFetch. É assim que os fios
  (`src/render/CrowdWires.tsx`) seguem os agentes sem tráfego CPU↔GPU.
- Data layer M3 (`src/data/`): `contentStore.ts` (zustand) carrega
  `public/content/` (cópia de `acervo/export/` via `npm run sync-content`,
  automático em predev/prebuild; gitignored). Sem content/ → fallback
  procedural silencioso. Pessoas reais = slots 0..45 (ordem do manifest);
  cor por núcleo no `iColorScale` (nenhum vertex buffer novo); alvos
  (gravidade/lentes) via `computeTargets()` + `sim.commitTargets()`.
- Debug M3: query params `gravity`, `mapScale`, `lens`, `wires`,
  `wiresAlpha`, `gravForca`; debug cor "alvo" (R=dist/20, G=tem-alvo);
  `scripts/probe.mjs "<url>"` imprime estado do seek + readback GPU real
  das posições (`window.__limiarSim` / `__limiarReadPositions`, só em dev).
- **Lentes demográficas** (`src/data/demoLens.ts` + `?dlens=sexo|decada|
  causa|geo|religiao|tempo`): classificação/bucketing CPU dos campos
  `demographics` (destilados em `content/demographics.json` pelo
  sync-content), layouts por alvo (setores; década = linha do tempo no eixo
  X; tempo = dois arcos), cores por categoria pela MESMA via `iColorScale`
  (fillContentAttributes com `demoCls`), legenda no HUD via
  `useDemoLens` (zustand). Exclusão mútua com a lente de elemento no
  CrowdMesh (a que mudou vence; na URL com as duas, dlens ganha). Trocar
  lente não reseta a sim. Verificação offline sem navegador:
  `node scripts/demo-lens-check.mjs` (bundla o TS real com rolldown e roda
  contra public/content/). `?simT` pré-rola até 60 s (3600 steps).
- O pre-roll do `?simT` espera o 2º frame (leva entrega valores reais após
  o 1º commit — no 1º frame rodaria com defaults).
- Spawn permuta o índice (`i×197 mod count`) para as pessoas reais não
  nascerem enfileiradas no canto do grid.
- Fase do passo por agente integra a velocidade (`phasePerUnit` frames por
  unidade percorrida) — o walk cycle gruda no chão em qualquer velocidade.
- **VATs próprias sem Houdini**: motor em `tools/vat-core.mjs`, com duas
  frentes — **VAT Studio** (`npm run studio` → localhost:5198, interface
  visual com preview, orçamento com semáforo e decimação meshoptimizer) e a
  CLI `tools/vat-bake.mjs` (GLB/Mixamo → .bin float16 + vat.json em
  `public/vat/<nome>/`; guia em `tools/README.md`). Em runtime, `?vat=<nome>`
  troca o descriptor ativo (`src/vat/runtime.ts`, basis `identity`, pés no
  y=0); sem o parâmetro, vale o asset legado acima. Assets custom são
  `indexed` por padrão (index buffer + textura por vértice único — download
  menor); limite duro: 8192 colunas de textura. E2E do Studio:
  `node tools/studio/e2e.mjs`.
- **VAT Studio v2** (formato `vat-bake/2`): na lista de clipes dá para
  **remover** (×), **duplicar** (⧉) e **combinar 2+ clipes num track só**
  (`tools/merge-clips.mjs` — concatenação com crossfade, compartilhado
  Node/browser: preview = bake). "Andar no lugar" agora **exporta a
  trajetória removida** no descriptor (`rootMotion: [{clip, samples}]`, 1
  amostra/frame na escala do bake) — multidão ignora (movimento vem da sim);
  one-shots dirigidos podem aplicá-la como translate (`src/vat/rootMotion.ts`,
  toggle no leva do personagem). `meshHash` (bind pose pós-decimação) grava a
  identidade da malha; **`?vat=a&vatB=b` carrega DUAS VATs da mesma malha**
  e o crossfade cruza texturas: linhas de B empilhadas abaixo das de A na
  DataTexture combinada, clipes com índice global contínuo, posições de B
  re-normalizadas para o espaço de A no load — shader inalterado, zero
  binding extra (não toca no limite de 8 vertex buffers). Validação recusa
  (com aviso claro) contagem de vértices/framesPerClip/topologia/basis
  diferentes; player: `vatPlayer.play(i, { vat: "nome" })`.
- **Cuidado nesta máquina (iCloud)**: `~/Documents` sincroniza no iCloud e
  arquivos "dataless" (evictados) fazem git/tsc TRAVAREM em leitura. Sintoma:
  processo dorme para sempre em `read`. Cura: `brctl download <caminho>` (ou
  `rm -rf node_modules && npm install`, que recria tudo local).

## Verificação

- `npm run typecheck` e `npm run build` devem passar.
- Verificação visual headless (requer Chrome): `npm run dev` + `node scripts/screenshot.mjs "http://localhost:5199/?leva=0" out.png`.
  Parâmetros de URL úteis: `clip`, `frame`, `pause`, `basis`, `scale`, `forceWebGL`, `leva`.
- Teste sempre nos dois backends (WebGPU e `?forceWebGL=1`).

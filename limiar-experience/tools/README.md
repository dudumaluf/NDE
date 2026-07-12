# tools — VAT sem Houdini (Studio + CLI)

Gera as texturas de animação (VAT) que o app consome a partir de arquivos
GLB/GLTF com skinned mesh + animações — fluxo típico: **Mixamo**. Saída no
formato do doc 03 §3: **`.bin` float16 raw + `vat.json`** em
`public/vat/<nome>/`, carregada no app com `?vat=<nome>` na URL.

Duas portas de entrada para o mesmo motor (`tools/vat-core.mjs`):

| | comando | para quem |
|---|---|---|
| **VAT Studio** (recomendado) | `npm run studio` → http://localhost:5198 | quem não quer decidir números |
| CLI | `node tools/vat-bake.mjs …` | automação/scripts |

## VAT Studio (interface visual)

```bash
cd limiar-experience
npm run studio          # → http://localhost:5198
npm run dev             # (opcional, noutra aba) app na 5199 para testar o resultado
```

Fluxo na página:

1. **Arraste os GLB** (o arquivo com skin vira o personagem; os demais podem
   ser só animações do mesmo esqueleto). FBX não é aceito — converta antes
   (guia abaixo).
2. **Preview 3D** com órbita; cada clipe tem botão ▶ para conferir.
3. **Clipes**: reordene arrastando (a ordem vira a ordem na textura e nos
   botões do app), renomeie clicando no nome, e escolha **loop** (idle,
   andar…) ou **única** (morrer, levantar — congela no último frame).
   Clipes que deslocam a raiz ganham o toggle "andar no lugar" (sugerido
   automaticamente — para multidão o passo vem da simulação).
4. **Preset de intenção**: *Multidão* (18 fps, malha enxuta) ou *Personagem
   próximo* (30 fps, mais detalhe).
5. **Orçamento** antes de assar: vértices por pessoa, dimensão da textura,
   peso do download — com semáforo verde/amarelo/vermelho e **correções de
   1 clique** (reduzir malha via meshoptimizer com preview antes/depois
   lado a lado; baixar frames por clipe).
6. **Gerar texturas** → progresso ao vivo, validação automática (selftest) e
   botão "testar na experiência" (abre o app com `?vat=<nome>`).

Limites que o semáforo usa (por que existem):

- **Malha**: verde ≤ 2.500 vértices, amarelo ≤ 6.000 (multidão) — cada pessoa
  da multidão desenha isso por frame; o personagem original do patch usa
  **1.590**. No preset *personagem próximo*: verde ≤ 6.000.
- **Textura**: verde ≤ 2.048 px, amarelo ≤ 4.096 px, limite duro 8.192
  colunas (WebGPU default) — o bake recusa acima disso.
- **Download**: verde ≤ 8 MB, amarelo ≤ 20 MB (posições + normais float16
  + índices).

## CLI

```bash
node tools/vat-bake.mjs <personagem.glb> [anim2.glb ...] --out public/vat/<nome> [opções]
```

### Exemplo validado (Soldier do three.js)

```bash
node tools/vat-bake.mjs tools/fixtures/Soldier.glb --out public/vat/soldier \
  --skip TPose --selftest
# → http://localhost:5199/?vat=soldier&scene=personagem  (e &forceWebGL=1)
```

### Opções

| Flag | Default | O quê |
|---|---|---|
| `--out <dir>` | — | diretório de saída (nome do dir = nome do asset na URL) |
| `--frames <n>` | 60 | frames assados por clipe (todos os clipes têm o mesmo n) |
| `--fps <n>` | 18 | velocidade de playback gravada no descriptor (paridade com o patch) |
| `--clip Nome:loop\|oneshot` | loop | modo de playback por clipe (one-shot segura o último frame) |
| `--skip Nome` | — | não assa esse clipe (ex.: `--skip TPose`) |
| `--height <h>` | 0.7 | normaliza a altura (frame 0 do 1º clipe) para `h` — 0.7 é a convenção do asset legado (com escala 2.5 do app ≈ 1.75 no mundo); `0` mantém o tamanho original |
| `--max-verts <n>` | 0 | decima a malha até ≤ n vértices únicos (meshoptimizer) antes do bake — ex.: `--max-verts 2500` para multidão |
| `--topology soup\|indexed\|auto` | auto | `soup` = triangle soup como o asset legado; `indexed` = textura por vértice único + index buffer (menor download); `auto` = indexed sempre que a malha compartilha vértices |
| `--in-place` | off | congela a translação XZ do osso raiz em todos os clipes (no Studio isso é por clipe) |
| `--selftest` | off | valida o resultado (dimensões, NaN, loops fecham, pé no chão, normais) |

`--selftest` sozinho (sem inputs) revalida um diretório já assado:
`node tools/vat-bake.mjs --out public/vat/soldier --selftest`.

## Fluxo Mixamo (o caso típico)

1. No [Mixamo](https://www.mixamo.com), escolha o personagem e baixe **uma vez
   com skin** (Format: FBX Binary, Skin: With Skin) — esse é o arquivo do
   personagem. Baixe cada animação adicional **sem skin** (Skin: Without Skin,
   30 fps, sem keyframe reduction) — animações Mixamo já são cíclicas, os
   loops fecham.
2. Converta FBX → GLB (a ferramenta lê GLB/GLTF; FBX direto não é suportado):
   - **Blender** (GUI): `File → Import → FBX`, depois
     `File → Export → glTF 2.0 (.glb)` — sem compressão Draco/Meshopt.
   - **Blender CLI** (testado com Blender 4.x):

     ```bash
     blender -b -P - <<'EOF'
     import bpy
     bpy.ops.wm.read_factory_settings(use_empty=True)
     bpy.ops.import_scene.fbx(filepath="personagem.fbx")
     bpy.ops.export_scene.gltf(filepath="personagem.glb", export_format="GLB")
     EOF
     ```

   - ou [FBX2glTF](https://github.com/facebookincubator/FBX2glTF):
     `FBX2glTF -b personagem.fbx -o personagem.glb`
3. Arraste os GLB no Studio (ou rode a CLI) — o personagem/esqueleto vem do
   arquivo **com skin**; os demais podem conter só animação. Clipes com nome
   genérico (`mixamo.com`, `Take 001`…) são renomeados para o nome do arquivo
   — `morrer.glb` vira o clipe `morrer`.

## O que sai (`public/vat/<nome>/`)

- `positions_f16.bin` / `normals_f16.bin` — RGB float16 raw, largura =
  colunas (vértices), altura = `clipes × frames` empilhados verticalmente na
  ordem escolhida. Posições em Y-up (basis `identity`), pés no y=0, centro XZ
  na origem; normais como vetores unitários crus (decode = só normalize,
  como no asset legado).
- `indices_u32.bin` — topologia `indexed`: index buffer da malha (o
  `vertexIndex` do shader segue sendo a coluna da VAT).
- `vat.json` — descriptor (`format: "vat-bake/1"`): dimensões, clipes
  (nome/modo/range de linhas), fps, basis, normalização aplicada
  (translate/scale), bounds e decimação (se houve) — tudo que o app precisa
  em `src/vat/runtime.ts`.

## Como o app carrega (`?vat=<nome>`)

`src/main.tsx` chama `initVat()` antes do primeiro render: com `?vat=<nome>`,
o descriptor ativo passa a ser `public/vat/<nome>/vat.json`; sem o parâmetro
(ou em qualquer falha), o app usa o **asset legado do patch** (EXRs +
basis `x_negz_y` + bakeOffset) — o personagem original continua o default.
Os botões de estado (leva) são gerados do descriptor ativo; a multidão e o
morph A/B funcionam igual com qualquer asset.

## Limites conhecidos

- **Largura de textura ≤ 8.192** (limite WebGPU default): indexed = nº de
  vértices únicos; soup = nº de cantos de triângulo. Acima disso, use a
  redução de malha (Studio ou `--max-verts`).
- **Frames por clipe fixos** (o mesmo n para todos): clipes curtos ganham
  resolução temporal, longos perdem. O player assume grade regular
  (paridade com o formato do patch).
- FBX direto não é suportado (converter antes); Draco/Meshopt também não.
- Morph targets (blend shapes) não entram no bake — só skinning.
- "Andar no lugar" zera só a translação XZ da raiz; animações com root
  motion complexo (giro) podem precisar de ajuste na origem (Blender).
- Texturas/materiais do GLB são ignorados no bake: o app renderiza com o
  material neutro próprio (sem UVs no pipeline, como o asset legado). O
  preview do Studio mostra os materiais originais só para conferência.
- A decimação preserva o skinning (os vértices sobreviventes mantêm seus
  pesos), mas malhas muito reduzidas podem perder detalhe de silhueta —
  confira no preview antes/depois.

## Teste de fumaça (E2E)

Com o Studio (5198) e o app (5199) no ar:

```bash
node tools/studio/e2e.mjs   # sobe o Soldier, decima, assa e valida — grava shots/studio-*.png
```

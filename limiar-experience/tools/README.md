# tools/vat-bake — texturas VAT a partir de GLB (Mixamo etc.)

Gera as texturas de animação (VAT) que o app consome a partir de arquivos
GLB/GLTF com skinned mesh + animações — sem Houdini. Sai no formato do
doc 03 §3: **`.bin` float16 raw + `vat.json`** em `public/vat/<nome>/`,
carregado no app com `?vat=<nome>` na URL.

```bash
node tools/vat-bake.mjs <personagem.glb> [anim2.glb ...] --out public/vat/<nome> [opções]
```

## Exemplo validado (Soldier do three.js)

```bash
node tools/vat-bake.mjs tools/fixtures/Soldier.glb --out public/vat/soldier \
  --skip TPose --selftest
# → http://localhost:5199/?vat=soldier&scene=personagem  (e &forceWebGL=1)
```

## Fluxo Mixamo (o caso típico)

1. No [Mixamo](https://www.mixamo.com), escolha o personagem e baixe **uma vez
   com skin** (Format: FBX Binary, Skin: With Skin) — esse é o arquivo do
   personagem. Baixe cada animação adicional **sem skin** (Skin: Without Skin,
   30 fps, sem keyframe reduction) — animações Mixamo já são cíclicas, os
   loops fecham.
2. Converta FBX → GLB (a ferramenta lê GLB/GLTF; FBX direto não é suportado):
   - **Blender CLI** (recomendado, testado com Blender 4.x):

     ```bash
     blender -b -P - <<'EOF'
     import bpy, sys
     bpy.ops.wm.read_factory_settings(use_empty=True)
     bpy.ops.import_scene.fbx(filepath="personagem.fbx")
     bpy.ops.export_scene.gltf(filepath="personagem.glb", export_format="GLB")
     EOF
     ```

   - ou [FBX2glTF](https://github.com/facebookincubator/FBX2glTF):
     `FBX2glTF -b personagem.fbx -o personagem.glb`
   - Não use compressão Draco/Meshopt no export (o bake não carrega decoders).
3. Rode o bake — o personagem/esqueleto vem do **primeiro** arquivo; os
   demais podem conter só animação (mesmo esqueleto):

   ```bash
   node tools/vat-bake.mjs personagem.glb andar.glb morrer.glb \
     --out public/vat/meu-char --clip morrer:oneshot --selftest
   ```

   Clipes com nome genérico (`mixamo.com`, `Take 001`…) são renomeados para o
   nome do arquivo — `morrer.glb` vira o clipe `morrer`.

## Opções

| Flag | Default | O quê |
|---|---|---|
| `--out <dir>` | — | diretório de saída (nome do dir = nome do asset na URL) |
| `--frames <n>` | 60 | frames assados por clipe (todos os clipes têm o mesmo n) |
| `--fps <n>` | 18 | velocidade de playback gravada no descriptor (paridade com o patch) |
| `--clip Nome:loop\|oneshot` | loop | modo de playback por clipe (one-shot segura o último frame) |
| `--skip Nome` | — | não assa esse clipe (ex.: `--skip TPose`) |
| `--height <h>` | 0.7 | normaliza a altura do personagem (frame 0 do 1º clipe) para `h` — 0.7 é a convenção do asset legado (com escala 2.5 do app ≈ 1.75 no mundo); `0` mantém o tamanho original |
| `--topology soup\|indexed\|auto` | auto | `soup` = triangle soup como o asset legado; `indexed` = textura por vértice único + index buffer (necessário p/ malhas grandes); `auto` decide |
| `--in-place` | off | congela a translação XZ do osso raiz (animações Mixamo "com deslocamento" passam a andar no lugar) |
| `--selftest` | off | valida o resultado (dimensões, NaN, loops fecham, pé no chão, normais) |

`--selftest` sozinho (sem inputs) revalida um diretório já assado:
`node tools/vat-bake.mjs --out public/vat/soldier --selftest`.

## O que sai (`public/vat/<nome>/`)

- `positions_f16.bin` / `normals_f16.bin` — RGB float16 raw, largura =
  colunas (vértices), altura = `clipes × frames` empilhados verticalmente na
  ordem dos argumentos. Posições em Y-up (basis `identity`), pés no y=0,
  centro XZ na origem; normais como vetores unitários crus (decode = só
  normalize, como no asset legado).
- `indices_u32.bin` — só na topologia `indexed`: index buffer da malha (o
  `vertexIndex` do shader segue sendo a coluna da VAT).
- `vat.json` — descriptor (`format: "vat-bake/1"`): dimensões, clipes
  (nome/modo/range de linhas), fps, basis, normalização aplicada
  (translate/scale) e bounds — tudo que o app precisa em
  `src/vat/runtime.ts`.

## Limites conhecidos

- **Largura de textura ≤ 8192** (limite WebGPU default): soup = nº de cantos
  de triângulo (3× triângulos); indexed = nº de vértices únicos. Malha típica
  do Mixamo (~7–15k verts) só passa como `indexed`; acima de 8192 vértices
  únicos, decime a malha (Blender: modifier *Decimate*) — para uma multidão,
  malhas de 1–3k vértices são o alvo sensato.
- **Frames por clipe fixos** (`--frames` vale para todos os clipes): clipes
  curtos ganham resolução temporal, longos perdem. O player assume grade
  regular (paridade com o formato do patch).
- FBX direto não é suportado (converter antes); Draco/Meshopt também não.
- Morph targets (blend shapes) não entram no bake — só skinning.
- `--in-place` zera só a translação XZ da raiz; animações com root motion
  complexo (giro) podem precisar de ajuste na origem (Blender).
- Texturas/materiais do GLB são ignorados: o app renderiza com o material
  neutro próprio (sem UVs no pipeline, como o asset legado).

## Como o app carrega (`?vat=<nome>`)

`src/main.tsx` chama `initVat()` antes do primeiro render: com `?vat=<nome>`,
o descriptor ativo passa a ser `public/vat/<nome>/vat.json`; sem o parâmetro
(ou em qualquer falha), o app usa o **asset legado do patch** (EXRs +
basis `x_negz_y` + bakeOffset) — o personagem original continua o default.
Os botões de estado (leva) são gerados do descriptor ativo; a multidão e o
morph A/B funcionam igual com qualquer asset.

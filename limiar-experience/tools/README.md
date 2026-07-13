# tools — VAT sem Houdini (Studio + CLI)

Gera as texturas de animação (VAT) que o app consome a partir de arquivos
**GLB/GLTF ou FBX binário** com skinned mesh + animações — fluxo típico:
**Mixamo, arrastando os FBX direto** (sem Blender). Saída no formato do
doc 03 §3: **`.bin` float16 raw + `vat.json`** em `public/vat/<nome>/`,
carregada no app com `?vat=<nome>` na URL.

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

1. **Arraste os arquivos** — GLB/GLTF ou **FBX binário do Mixamo direto**
   (o arquivo com skin vira o personagem; os demais podem ser só animações
   do mesmo esqueleto). FBX ASCII/antigo não é aceito — a UI explica e o
   plano B é converter para GLB (guia abaixo).
2. **Preview 3D** com órbita; cada clipe tem botão ▶ para conferir.
3. **Clipes**: reordene arrastando (a ordem vira a ordem na textura e nos
   botões do app), renomeie clicando no nome, e escolha **loop** (idle,
   andar…) ou **única** (morrer, levantar — congela no último frame).
   Clipes que deslocam a raiz ganham o toggle "andar no lugar" (sugerido
   automaticamente — ver *Root motion* abaixo). Cada linha tem ainda
   **× (remover)** — tira o clipe da lista e o orçamento recalcula na hora —
   e **⧉ (duplicar)** — para usar o mesmo clipe 2× (ex.: num combinado).
4. **Combinar clipes**: marque **comb.** em 2+ clipes e clique "combinar" —
   eles viram UM clipe contínuo (concatenação com crossfade curto e
   configurável entre as partes, default 0,2 s). Útil para micro-variações:
   idle + olhar + idle vira um idle longo sem gastar slots de clipe. A ordem
   é a ordem em que você marcou; para o loop fechar, comece e termine com o
   mesmo clipe cíclico (use ⧉). O preview toca EXATAMENTE o que será assado
   (mesmo motor de merge, `tools/merge-clips.mjs`); "separar" desfaz.
5. **Preset de intenção**: *Multidão* (18 fps, malha enxuta) ou *Personagem
   próximo* (30 fps, mais detalhe).
6. **Orçamento** antes de assar: vértices por pessoa, dimensão da textura,
   peso do download — com semáforo verde/amarelo/vermelho e **correções de
   1 clique** (reduzir malha via meshoptimizer com preview antes/depois
   lado a lado; baixar frames por clipe).
7. **Gerar texturas** → progresso ao vivo, validação automática (selftest),
   botão "testar na experiência" (abre o app com `?vat=<nome>`) e o aviso de
   **morfabilidade**: se outro export tem o MESMO `meshHash` (mesma malha,
   mesma redução), o resultado sai "morfável com X" com botão para testar o
   morph entre as duas texturas (`?vat=a&vatB=b`); malha diferente sai
   "não-morfável" — o esperado entre personagens diferentes.

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

### Exemplos validados

```bash
# GLB (Soldier do three.js)
node tools/vat-bake.mjs tools/fixtures/Soldier.glb --out public/vat/soldier \
  --skip TPose --selftest
# → http://localhost:5199/?vat=soldier&scene=personagem  (e &forceWebGL=1)

# FBX Mixamo direto (personagem com skin + animação sem skin)
node tools/vat-bake.mjs tools/fixtures/samba.fbx tools/fixtures/samba-anim.fbx \
  --out public/vat/samba --max-verts 2500 --selftest
# → http://localhost:5199/?vat=samba&scene=personagem
```

### Opções

| Flag | Default | O quê |
|---|---|---|
| `--out <dir>` | — | diretório de saída (nome do dir = nome do asset na URL) |
| `--frames <n>` | 60 | frames assados por clipe (todos os clipes têm o mesmo n) |
| `--fps <n>` | 18 | velocidade de playback gravada no descriptor (paridade com o patch) |
| `--clip Nome:loop\|oneshot` | loop | modo de playback por clipe (one-shot segura o último frame) |
| `--skip Nome` | — | não assa esse clipe (ex.: `--skip TPose`) |
| `--y-offset Nome:v` | — | offset Y manual do clipe (unidades da fonte). O chão é automático por clipe — isto soma em cima (fontes fora do padrão) |
| `--height <h>` | 0.7 | normaliza a altura (frame 0 do 1º clipe) para `h` — 0.7 é a convenção do asset legado (com escala 2.5 do app ≈ 1.75 no mundo); `0` mantém o tamanho original |
| `--max-verts <n>` | 0 | decima a malha até ≤ n vértices únicos (meshoptimizer) antes do bake — ex.: `--max-verts 2500` para multidão |
| `--topology soup\|indexed\|auto` | auto | `soup` = triangle soup como o asset legado; `indexed` = textura por vértice único + index buffer (menor download); `auto` = indexed sempre que a malha compartilha vértices |
| `--in-place` | off | congela a translação XZ do osso raiz em todos os clipes (no Studio isso é por clipe) e **exporta a trajetória removida** em `rootMotion` no vat.json |
| `--selftest` | off | valida o resultado (dimensões, NaN, loops fecham, pé no chão, normais, rootMotion) |

`--selftest` sozinho (sem inputs) revalida um diretório já assado:
`node tools/vat-bake.mjs --out public/vat/soldier --selftest`.

## Fluxo Mixamo (o caso típico) — FBX direto, sem Blender

1. No [Mixamo](https://www.mixamo.com), escolha o personagem e baixe **uma
   vez com skin** (Format: **FBX Binary**, Skin: **With Skin**) — esse é o
   arquivo do personagem. Baixe cada animação adicional **sem skin** (Skin:
   **Without Skin**, 30 fps, sem keyframe reduction) — animações Mixamo já
   são cíclicas, os loops fecham.
2. **Arraste os FBX no Studio** (ou passe na CLI). O que é normalizado
   automaticamente (`tools/fbx-normalize.mjs`, compartilhado com o preview):
   - **escala**: FBX do Mixamo vem em centímetros (`UnitScaleFactor` 1) —
     convertido para metros (fator 0,01) assado na geometria, ossos, bind
     matrices e tracks; arquivos sem `UnitScaleFactor` legível usam
     heurística pela pose de descanso (humano de ~175 "unidades" = cm);
   - **ossos** `mixamorig:Hips` → `mixamorigHips` (o próprio loader remove o
     `:`, mesma convenção do GLB do Blender — dá para misturar FBX e GLB do
     mesmo esqueleto que o retarget casa por nome);
   - **clipes** com nome genérico (`mixamo.com`, `Take 001`, `Armature|…`)
     são renomeados para o nome do arquivo (`samba.fbx` vira o clipe
     `samba`); takes vazios do Mixamo são descartados;
   - animação **sem malha** ("Without Skin"): funciona como GLB de animação
     avulsa — as tracks retargetam para o personagem carregado; a lista de
     clipes mostra `N/M tracks casam` e acusa **✗ esqueleto incompatível**
     (clipe já desmarcado) quando nada casa;
   - **misturar base GLB + animação FBX** (ou vice-versa) funciona: tracks
     de posição/rotação são **rebaseadas para a convenção do rig da base**
     (`tools/retarget-units.mjs` — rigs GLB do Blender guardam ossos em cm,
     Z-up, sob nó 0,01 e reorientam juntas; sem o rebase o corpo afundava,
     "chão na cintura", ou tombava). Tracks de containers ("Armature") de
     outros arquivos são ignoradas — só ossos entram;
   - **chão por clipe**: no bake, CADA clipe é aterrado com os pés no y=0
     (offset automático registrado em `clips[].groundOffset` no vat.json).
     O campo **Y** ao lado de loop/única é o ajuste MANUAL por clipe
     (unidades da fonte; vazio = só o automático) — vale no preview e no
     bake, e sai documentado como `clips[].yOffset` quando usado.
3. **O que ainda pede conversão** (o Studio/CLI recusam com a mensagem
   certa): FBX **ASCII** ou **6.x antigo** (o Mixamo atual exporta binário
   7.x, suportado). Nesses casos, converta para GLB:
   - **Blender** (GUI): `File → Import → FBX`, depois
     `File → Export → glTF 2.0 (.glb)` — sem compressão Draco/Meshopt.
   - **Blender CLI** (testado com Blender 4.x/5.x):

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

   Texturas/materiais do FBX são **irrelevantes** aqui (o bake ignora, como
   no GLB): não precisa se preocupar com texturas embutidas ou ausentes.

## O que sai (`public/vat/<nome>/`)

- `positions_f16.bin` / `normals_f16.bin` — RGB float16 raw, largura =
  colunas (vértices), altura = `clipes × frames` empilhados verticalmente na
  ordem escolhida. Posições em Y-up (basis `identity`), pés no y=0, centro XZ
  na origem; normais como vetores unitários crus (decode = só normalize,
  como no asset legado).
- `indices_u32.bin` — topologia `indexed`: index buffer da malha (o
  `vertexIndex` do shader segue sendo a coluna da VAT).
- `vat.json` — descriptor (`format: "vat-bake/2"`): dimensões, clipes
  (nome/modo/range de linhas), fps, basis, normalização aplicada
  (translate/scale), bounds, decimação (se houve) e os dois campos novos:

  - **`meshHash`** — identidade da malha: SHA-1 (16 hex) das posições de bind
    dos vértices que entram na textura (pós-decimação) + ordem de desenho.
    Dois exports com o mesmo hash endereçam OS MESMOS vértices por coluna —
    é o que autoriza o morph entre texturas no app. O mesmo personagem com
    reduções diferentes tem hashes diferentes (use o mesmo alvo de redução).
  - **`rootMotion`** — só para clipes assados "no lugar" que de fato
    deslocavam: `[{ clip, samples: [[x,y,z], …] }]`, uma amostra por frame
    (mesma grade das linhas da textura), já na escala do bake. Semântica:
    o skinning ficou in-place; `samples[f]` é o deslocamento que a raiz teria
    no frame f. **Multidão simulada: ignore** (o movimento vem da simulação —
    por isso in-place é o default). **One-shots dirigidos/cinemáticos**: some
    a amostra (× a escala do app) ao translate do mesh para reproduzir a
    trajetória original — helper pronto em `src/vat/rootMotion.ts`, demo no
    toggle "root motion (translate)" do personagem (leva).

## Como o app carrega (`?vat=<nome>` e `?vatB=<nome>`)

`src/main.tsx` chama `initVat()` antes do primeiro render: com `?vat=<nome>`,
o descriptor ativo passa a ser `public/vat/<nome>/vat.json`; sem o parâmetro
(ou em qualquer falha), o app usa o **asset legado do patch** (EXRs +
basis `x_negz_y` + bakeOffset) — o personagem original continua o default.
Os botões de estado (leva) são gerados do descriptor ativo; a multidão e o
morph A/B funcionam igual com qualquer asset.

**Morph entre duas VATs** (`?vat=a&vatB=b`): carrega uma segunda VAT **da
mesma malha** e permite crossfade entre um clipe de A e um clipe de B — sem
precisar assar todas as animações numa textura só. Como funciona: as linhas
de B são empilhadas abaixo das de A numa DataTexture combinada e os clipes
de B ganham índices globais contínuos (`A.clipCount…`); o shader não muda
(o crossfade já endereça qualquer linha), então nada de bindings extras nem
custo novo — vale para o personagem E para a multidão. As posições de B são
re-normalizadas para o espaço de A no load (bakes separados normalizam
diferente). No leva aparece o dropdown "textura (VAT)" + botões de teste;
via código, `vatPlayer.play(i, { vat: "b" })`. Restrições (validadas no
load, recusa com aviso no console e o app segue só com A): mesma contagem
de vértices, mesmo `framesPerClip`, mesma topologia e basis; `meshHash`
diferente com contagem igual = aviso (renderiza, mas geometricamente não
faz sentido). O Studio avisa a morfabilidade ao gerar.

## Limites conhecidos

- **Largura de textura ≤ 8.192** (limite WebGPU default): indexed = nº de
  vértices únicos; soup = nº de cantos de triângulo. Acima disso, use a
  redução de malha (Studio ou `--max-verts`).
- **Frames por clipe fixos** (o mesmo n para todos): clipes curtos ganham
  resolução temporal, longos perdem. O player assume grade regular
  (paridade com o formato do patch). Clipes combinados são UM clipe — os
  mesmos n frames cobrem a duração somada (menos resolução temporal por
  parte; combine poucos clipes ou aumente frames).
- Um clipe **combinado** marcado como loop só fecha se começar e terminar
  com o mesmo clipe cíclico (o selftest acusa quando não fecha).
- **FBX**: só binário 7.x (padrão do Mixamo atual). ASCII e 6.x antigos são
  recusados com mensagem clara — converter para GLB. GLB com Draco/Meshopt
  também não é lido (re-exporte sem compressão). O selftest ainda vigia
  unidades mistas entre fontes (clipe 100× maior/menor que o 1º = cm vs m).
- Morph targets (blend shapes) não entram no bake — só skinning.
- "Andar no lugar" zera só a translação XZ da raiz (a trajetória removida
  sai em `rootMotion`); animações com root motion complexo (giro) podem
  precisar de ajuste na origem (Blender).
- O morph entre VATs (`?vatB=`) exige malha idêntica — personagens
  diferentes (ou o mesmo com reduções diferentes) não morfam, por
  construção; o Studio e o console do app avisam.
- Texturas/materiais do GLB são ignorados no bake: o app renderiza com o
  material neutro próprio (sem UVs no pipeline, como o asset legado). O
  preview do Studio mostra os materiais originais só para conferência.
- A decimação preserva o skinning (os vértices sobreviventes mantêm seus
  pesos), mas malhas muito reduzidas podem perder detalhe de silhueta —
  confira no preview antes/depois.

## Teste de fumaça (E2E)

Com o Studio (5198) e o app (5199) no ar:

```bash
node tools/studio/e2e.mjs   # GLB: Soldier (deleta clipe, combina, assa) + FBX: samba (Mixamo direto) — grava shots/studio-*.png
```

Fixtures em `tools/fixtures/`: `Soldier.glb` (three.js), `samba.fbx`
("Samba Dancing" do Mixamo, via repo do three.js — personagem X Bot com
skin, FBX binário 7.4 em cm, clipe "mixamo.com"), `samba-anim.fbx` (a mesma
animação SEM malha, derivada no Blender — caso "Without Skin"),
`xbot.glb` (o mesmo X Bot convertido para GLB no Blender, sem animações —
base do caso "GLB + anim FBX", regressão do bug do chão na cintura) e
`old-ascii.fbx` (FBX 6.1 ASCII mínimo para o caso de erro).

# Crowd — Análise Técnica Completa do Patch cables.gl

> Blueprint de engenharia reversa do export `js/Crowd.json` (344 ops, 479 conexões).
> Serve de referência para o port em React Three Fiber + WebGPU e para a evolução
> do projeto de visualização de dados sobre NDE (Near Death Experiences).

---

## 1. Contexto e visão do projeto

O patch é o protótipo visual de um **visualizador de dados vivo sobre experiências de
quase-morte**, baseado nos relatos do canal do YouTube *"Afinal o que somos nós"*:

- Uma multidão de pessoas 3D, onde **cada pessoa = uma história/relato**;
- Clicar numa pessoa = segui-la e ouvir sua história (vídeo do canal);
- Pessoas com histórias similares se **agrupam em clusters** (conceito t-SNE 3D vivo);
- Estados de animação representam momentos da história: *idle* (história não ativada),
  *andando* (história sendo ouvida), *morrendo/caindo*, *levantando/rezando* (o retorno);
- Mistura de arte, dados e jogo de descoberta.

Partes dessa visão **já estão cableadas no patch**: 268 nomes brasileiros e 136 IDs de
vídeos do canal conectados ao sistema de clique (ver §8 e `data/`).

## 2. Sumário executivo

Simulação de multidão 100% em GPU via **GPGPU de texturas** (um pixel = uma pessoa),
personagens animados por **VAT (Vertex Animation Textures)** exportadas do Houdini,
renderizados com **GPU instancing** a partir das texturas de estado, com **picking por
ID buffer** em MRT, três rigs de câmera com transição interpolada, e cenografia
temática (céu de nuvens FBM, portal espiral no céu, trilhas ascendentes).

## 3. Inventário de assets

| Arquivo | Dimensões | Conteúdo |
|---|---|---|
| `658f1a9f..._ANIM_positions360f.exr` | 1590×360 float | VAT posições: 1590 vértices × 360 frames = **6 animações de 60 frames empilhadas verticalmente** |
| `658f1a9f..._ANIM_normals360f.exr` | 1590×360 | VAT normais (par do acima) |
| `Base_Character_WalkCycle28f_Dying28f_{positions,normals}.exr` | 1590×56 | VAT antiga: andar 28f + morrer 28f. Hoje só empresta a largura (1590) para dimensionar composes |
| `657b5f9f..._char_{positions,normals}.exr` | 1590×28 | **Órfã** — carregada, zero conexões |
| `lib_hdr_spree_bank.rgbe.png` | 1024×512 | Envmap HDR (RGBE 8bit) para IBL |
| `lib_images_flaredot.png` | 128×128 | Flare billboard sobre a pessoa seguida |
| `nde.mp3` (1.9MB), `whisper.mp3` (620KB) | — | **Não referenciados** — experimentos de áudio ambiente abandonados |
| `screenshot.png` | 640×360 | Preview do projeto |

A malha do personagem é **triangle soup sem índices**: 1590 vértices = 530 triângulos.
Largura da VAT = nº de vértices; altura = frames. Convenção Houdini Z-up (o patch
converte com rotação RGB de 90° em X e swizzle `.xzy` no shader).

## 4. Texturas de estado (o "cérebro" da multidão)

Todas RGBA 32bit float, `grid × grid` pixels (slider "Crowd Size Grid", default 16 →
256 pessoas; máx 128 → 16.384). Um pixel = uma pessoa; RGB = XYZ mundo (R=X, B=Z).

| Buffer | Conteúdo | Cálculo |
|---|---|---|
| **Spawn** | Posições iniciais | Gradiente X (R) + gradiente Y (B) = grade → `−0.5` → `×(10,1,10)` → `+ noise[-1,1] × "Spawn Pos Randomness"`. Y = 0.14 |
| **Posição** | Posição atual | base = spawn → DrawImage(posição anterior, amount=1) → forças (§5). Reset: um Bang zera o amount por 0.1s e o spawn "vaza" |
| **Direção** | Vetor unitário de movimento | `normalize(pos_atual − pos_anterior)` + blend 90% com direção anterior (suavização temporal) |
| **Cor** | Paleta por pessoa | NoiseTexture 8bit: R∈[0.5,1], G∈[0,0.8], B∈[0.1,1], seed 3 (rosa/roxo/branco) |
| **Wander** (snapshot) | Campo de direções Perlin | Perlin3D RGB[-1,1], canais R/B, **eixo Z do noise animado por `timer×0.125`** (campo evolui devagar), normalizado |
| **Seek** (snapshot) | Direção ao alvo | `normalize(alvo − pos) + noise×0.1` |
| **Máscara de atividade** | Quem "anda" | `length((pos−alvo).rb) × (1−DistanceSize)` → remap por falloff → branco perto do alvo; **+ máscara de pessoas clicadas**; acumulador temporal com decay 0.9 |
| **Ativação** (8bit, persistente) | Pessoas clicadas | BoolStateArray → ArrayToTexture; memória via feedback-copy; botão direito limpa (MonoFlop zera o feedback por 0.1s) |
| **Histórico** (512×256) | Trilhas | 512 frames de posição de 256 agentes amostrados (coluna 0 = frame atual, scroll →) |

Persistência entre frames: `ImageComposeSnapshot` (congela o estado no meio de uma
cadeia — ping-pong manual) e `CopyTexture` no fim do frame.

## 5. Física da multidão — 3 forças somadas (canais R/B = plano XZ)

```
pos += wander(perlin)  × 0.015 × (1 − máscaraAtividade)   // quem está FORA da área vagueia
pos += seek(alvo)      × (±0.015) × máscaraAtividade      // sinal = toggle "Attract"/"Repel"
pos += vortex(alvo)    × máscaraAtividade                  // toggle "Vortex": orbita o cursor
```

- **Alvo** = raycast do mouse contra colisor de chão (BoxAA 100×0.001×100), hit X/Z
  suavizado (`Anim.Smooth` fator 6).
- **Vortex** = op `ParticleForce_v4` tipo Vortex (raio 2, influence 0.5, falloff 1.01),
  normal Y, mascarado pelo canal R da máscara de atividade.
- Velocidade base: 0.015 unidades/frame (~0.9 un/s a 60fps).
- Semântica emergente: *quem está perto do alvo (ou já foi clicado) "acorda" e anda;
  o resto fica em idle vagueando de leve* — a semente do conceito de "histórias ativadas".

## 6. VAT — Vertex Animation Textures (6 estados de animação)

### Layout
A textura de 1590×360 tem **6 blocos de 60 frames**. O slider **"Posed Animations"
(0–5)** alimenta um `DrawImage` com `Position = slider × 0.2` que desliza uma **janela
de recorte de 60 linhas** — escolhendo qual animação a multidão usa. O recorte passa por:

1. `DrawImage` (crop com aspect ratio travado) para um framebuffer 1590×60;
2. `RgbMath c−x` com `(0.37, 0.40, 0.37)` — recentralização (offset de bake);
3. `RgbTransform` rotação X 90° — conversão Z-up (Houdini) → Y-up.

O recorte roda **uma vez** (`TriggerOnce` pós-load). Quirk: trocar o slider exige
"Reset Crowd" para re-renderizar o crop.

### Amostragem no vertex shader (op custom `GeometryFromTexture`)
Geometria "vazia" de 1590 vértices; posição real puxada por `gl_VertexID`
(*vertex pulling*):

```glsl
vec4 getAnimatedValue(sampler2D tex, vec2 texSize, float index, float timer)
{
    vec2 uv = vec2(index / texSize.x, -timer);   // wrap REPEAT → loop infinito
    uv.x += (1.0 / texSize.x) * 0.5;             // meio-texel
    return texture2D(tex, uv);
}
// instanciado: fase única por pessoa
vec4 res = getAnimatedValue(MOD_XYZ, size, float(gl_VertexID), MOD_time + instanceIndex / 82.5);
pos.xyz  = res.xzy;                               // swizzle Z-up → Y-up
```

- Timer global a velocidade 0.3 → loop de ~3.3s;
- `instanceIndex / 82.5` → **cada pessoa em fase diferente do ciclo**;
- Normais da textura irmã (mesmo lookup); há suporte a RGBE8 decode e a normais
  compactadas no canal alpha (não usados na config atual: `XYZ is RGB = 1`);
- Modo "Flipbook" (tiles) existe no op mas o patch usa modo "Lines" (linha = frame).

## 7. Instancing (op `MeshInstancerFromTexture_v3`)

Injeção de módulos de shader (sistema `ShaderModifier` ≈ `onBeforeCompile`/TSL):

- **Posição**: pixel da pessoa na textura de posição → coluna de translação da matriz;
- **Rotação**: modo "Normal" → `rotateMatrixDir(direção)` constrói base ortonormal a
  partir do vetor de movimento (a pessoa olha para onde anda). Modos Euler e
  Quaternion também existem no op;
- **Escala**: textura de noise (R∈[0.8,1]) → variação de altura por pessoa; × slider
  "Person Size" (default 10; 0.2 no modo debug com pirâmides);
- **Cor**: blend **Add** com `frag_instColor`; material PBR por cima;
- **Descarte**: alpha do pixel de posição < 0.5 → instância jogada para 999999
  (culling barato sem rebuild de buffer).

**Segundo instancer** (marcadores): geometria círculo (rot X 90°, +0.02 do chão),
posição = posições mascaradas pela ativação, escala = máscara de ativação, opacidade =
gradiente radial → **anéis no chão sob pessoas já "descobertas"**.

## 8. Picking em GPU e o sistema de "histórias"

1. Cena renderizada **2×** por frame: para a tela e para `RenderToTextures` MRT —
   slot 0 = posição de objeto, slot 1 = **Material/Object/Instance Id**;
2. `TextureColorPick` (readPixels) lê o pixel sob o mouse no buffer de IDs → canal
   Blue = índice da instância; comparador `blue < 0.9` + `Not` gera "está sobre uma
   pessoa" e habilita o clique;
3. Mouse-down esquerdo → `TriggerNumber` congela o índice. O índice alimenta:
   - `BoolStateArray[índice] = true` → máscara de ativação persistente;
   - `índice % 268` → **nome** (array de 268 nomes BR) → `TextMesh` billboard a
     y+1.64 sobre a pessoa (atrás de gate **desligado**);
   - `índice % 136` → **ID de vídeo do YouTube** → `YoutubePlayer` autoplay, CSS
     `opacity:0`, `Active=0` (**cableado, desligado**) — clicar numa pessoa = ouvir
     o relato dela;
   - índice → UV do pixel → `PixelColor` escreve a posição da pessoa numa textura
     **1×1** → `TextureColorPick` lê de volta → posição da pessoa em CPU (suavizada)
     → âncora da câmera "3rd", do flare dot e do nome.

Dados extraídos do patch: `data/nomes.json` (268) e `data/youtube_video_ids.json` (136).

## 9. Câmeras e interação

- **3 rigs** roteados por `SideBarSwitch` "WASD / Orbit / 3rd":
  - WASD: câmera andante, Shift = correr (velocidade 0.25→1 suavizada), eye height
    via TransformView y −2.85;
  - Orbit: raio 5, pivô y −1.3;
  - 3rd: OrbitControls **raio 0** posicionado na pessoa seguida (posição lida do
    picking §8, negada e suavizada com fator 36);
- **Transição de câmera**: `GetViewMatrix` de cada rig → `AnimMatrix` (easing Cubic
  In Out, 2s) **interpola as matrizes de view inteiras** → `MultiplyViewMatrix`;
- **Reset Cam / Reset Crowd** na sidebar; reset da multidão também no botão direito;
- Esfera marcadora (r 0.0125) no ponto de hit do mouse.

## 10. Cenografia e render

- **Material da multidão**: PBR roughness 0.3, metalness 0.891, IBL do envmap RGBE
  (código Babylon.js/Filament), tonemap sRGB, backface culling, ClearColor cinza 0.427;
- **Céu**: cilindro gigante (raio 40, comprimento 100, sem tampas, culling frontal,
  y+50, rot X 90°) com **FBM noise tileável animado** × gradiente de horizonte como
  textureOpacity de BasicMaterial;
- **Portal no céu** (tema NDE): a y+100, escala 80 — plano de 100×100 segmentos
  deslocado no vertex shader (`VertexPositionFromTexture`, modo Absolute) por um
  height map de círculo smoothstep (→ domo), texturizado com **espiral girando**
  (WaveformGradient senoidal → Twirl twist 2500 → rotação a −100/s) + vignette;
- **Chão**: `Grid` 170 linhas, espaçamento 0.25, fade radial via `ColorArea` esférico
  invertido (raio ~15, falloff 5, blend Opacity);
- **"Show Cables"**: histórico 512×256 (§4) → soma no canal G de um gradiente
  crescente (+rampa×30 + 0.55 constante) → trilhas antigas **sobem ao céu**; + kick
  na direção do movimento perto das colunas novas (direção × 0.17 mascarada por
  gradiente de borda); → `LinesArrayFromTexture` gera pares de linha entre colunas
  consecutivas → **fios etéreos subindo do caminho de cada pessoa** (gl.LINES,
  cinza, alpha 0.5);
- **Flare** billboard (flaredot.png, y+1.15, escala 0.64) sobre a pessoa seguida.

## 11. Ordem do frame (timeline de triggers)

```
MainLoop
├─ RenderToTextures MRT  ── renderiza a subárvore da cena p/ picking (IDs + posições)
├─ lê pixel do picking (TextureColorPick)
└─ render à tela (mesma subárvore):
   ├─ ClearColor
   ├─ update do bang de reset
   ├─ SIMULAÇÃO (composes 16×16):
   │  ├─ spawn
   │  ├─ scratch wander/seek (atualiza 2 snapshots)
   │  ├─ posição (forças §5)
   │  ├─ extração da pessoa selecionada (1×1) + máscara de ativação + posições dos anéis
   │  ├─ buffer de direção (+ cópias p/ próximo frame)
   │  ├─ máscara de atividade/distância (+ cópia)
   │  └─ cor
   ├─ câmeras (route WASD/Orbit/3rd → AnimMatrix blend)
   ├─ luz de ambiente PBR → materiais → multidão (VAT+instancing) / pirâmides (debug)
   ├─ céu, portal, chão, trilhas ("Show Cables"), marcadores, flare, nome (gate off)
   └─ sidebar/HUD
```

## 12. Quirks e pontas soltas

- `nde.mp3` / `whisper.mp3`: zero referências (áudio ambiente planejado, não ligado);
- YouTube player `Active=0`; TextMesh de nome atrás de `GateTrigger` fechado;
- EXR `657b..._char` órfã; timers e um `Math.Speed`/`Smooth` sem consumidores (debug);
- "Posed Animations" só atualiza após "Reset Crowd" (crop via `TriggerOnce`);
- O compose scratch wander/seek termina pintado de preto — os dados reais vivem nos
  snapshots (truque para reusar um framebuffer);
- Nome de arquivo diz "256vertices" mas a malha real tem 1590 vértices.

## 13. Mapa de port → React Three Fiber + WebGPU (three.js TSL)

| Técnica no cables | Equivalente no port |
|---|---|
| Texturas de estado + ImageCompose | **Compute shaders TSL** (`Fn().compute()`) com `instancedArray`/storage buffers — sem ping-pong de FBO |
| ImageComposeSnapshot / CopyTexture | Desnecessário — storage buffer lê/escreve no mesmo pass ou double-buffer explícito |
| VAT via `gl_VertexID` + textura | Igual: EXR → `DataTexture` float (EXRLoader do three), lookup por `vertexIndex` no vertex stage TSL |
| Crop do bloco de animação (DrawImage) | Offset de linha calculado no shader: `row = animIndex × 60 + frame` — **sem crop, por instância** |
| MeshInstancerFromTexture | `InstancedMesh` + TSL: matriz por instância montada no shader a partir dos buffers |
| Picking por MRT + readPixels | Render target de IDs + `readRenderTargetPixelsAsync`, ou raycast contra posições em CPU (N pequeno) |
| ShaderModifier (módulos GLSL) | TSL nodes (`positionNode`, `colorNode`, `normalNode`) |
| AnimMatrix (blend de câmeras) | Lerp/slerp de câmera com easing (maath / motion) |
| Sidebar | Leva/React UI |
| BufferRgbHistory + LinesArrayFromTexture | Storage buffer circular + `Line2`/LineSegments com posição via TSL |

### Melhorias destravadas pelo compute (backlog do port)

1. **Desvio e colisão entre pessoas** (o que o modelo de ImageCompose não expressa):
   *spatial hash grid* em compute → vizinhança O(1) → **boids** (separação +
   alinhamento + coesão) ou RVO simplificado; pessoas desviam e se empurram;
2. **Estado de animação POR PESSOA com crossfade**: cada agente com
   `{animA, animB, blend, fase}` → amostra 2 blocos da VAT e mistura — transições
   idle→walk→die→pray individuais (no patch o estado é global);
3. **Forças de clusterização por dados**: posições-alvo vindas de projeção
   UMAP/t-SNE dos embeddings das histórias; atração entre pessoas com elementos
   narrativos em comum = mais um termo no compute;
4. Trails como ribbons com fade; áudio posicional (nde.mp3/whisper.mp3); LOD.

## 14. Roadmap do projeto NDE (macro)

- **Fase A — Protótipo visual** (port R3F/WebGPU): paridade com o patch → depois
  melhorias 1 e 2 do backlog;
- **Fase B — Pipeline de dados**: listar vídeos do canal (os 136 IDs em `data/` são
  o ponto de partida) → transcrever (legendas automáticas do YouTube como primeira
  passada; Whisper para qualidade) → extração estruturada por LLM com taxonomia
  fundamentada (ex.: escala de Greyson: túnel, luz, revisão de vida, seres, paz,
  fronteira/retorno...) com citações + timestamps → embeddings multilíngues →
  clustering (HDBSCAN) + projeção 3D (UMAP) → `stories.json` + `graph.json`;
- **Fase C — Fusão**: cada agente ↔ uma história; clusters como atratores; clique →
  seguir + tocar vídeo/áudio + revelar conexões (linhas entre pessoas com elementos
  em comum — reusar a estética "Show Cables"); progresso de descoberta persistido;
- **Fase D — Gamificação e polish**: diário de descobertas, constelação de elementos,
  intro guiada, sound design, share.

> Nota ética: os relatos são testemunhos pessoais. Antes de publicar, vale contatar
> o canal para permissão/parceria — além de correto, pode virar colaboração.

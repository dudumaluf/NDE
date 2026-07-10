# LIMIAR — instruções para agentes

Leia antes de qualquer tarefa, nesta ordem:

1. `docs/00-visao-geral.md` — norte do projeto, princípios, ética
2. `docs/01-conceito-experiencia.md` — o design que este código serve (em conflito com a técnica, ele vence)
3. `docs/03-briefing-experiencia-3d.md` — arquitetura, stack e marcos (M0–M7) **incluindo a errata no §1**
4. `docs/ANALISE_TECNICA.md` — engenharia reversa do patch cables.gl original (fatos verificados)

## Método de trabalho

- Implemente **por marcos** (docs/03 §12), um por vez. Não avance sem os critérios de aceite do marco atual passarem.
- Commit ao final de cada marco, com tag (`m0`, `m1`, …).
- Todo TSL fica encapsulado em `src/vat/` e `src/sim/` — o resto do app não importa `three/tsl` diretamente.
- Nada de conteúdo hardcoded (histórias, cores, posições): tudo virá de `content/` (contrato no doc 02 §10 do repo do pipeline).

## Fatos técnicos verificados (não re-derivar)

- Malha do personagem: **1590 vértices** (530 triângulos, soup sem índices, sem UVs).
- VAT `public/vat/anim_{positions,normals}_360f.exr`: 1590×360 float, **6 clipes × 60 frames**;
  clipes: 0 idle · 1 andar · 2 idle var. · 3 queda/morte · 4 levantar · 5 rezar.
- Conversão de espaço: `pos = basis("x_negz_y") × (raw − bakeOffset)` — ver `src/vat/descriptor.ts`.
- Playback de paridade com o patch: ~18 fps (60 frames em ~3,33 s).

## Verificação

- `npm run typecheck` e `npm run build` devem passar.
- Verificação visual headless (requer Chrome): `npm run dev` + `node scripts/screenshot.mjs "http://localhost:5199/?leva=0" out.png`.
  Parâmetros de URL úteis: `clip`, `frame`, `pause`, `basis`, `scale`, `forceWebGL`, `leva`.
- Teste sempre nos dois backends (WebGPU e `?forceWebGL=1`).

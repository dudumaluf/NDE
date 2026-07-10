# LIMIAR — Experiência 3D

Port do patch cables.gl (multidão VAT + GPGPU) para **React Three Fiber + WebGPU/TSL**,
evoluindo para a experiência descrita em `docs/` (visão 00, conceito 01, briefing 03,
análise técnica do patch original).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5199
npm run build      # typecheck + build de produção
```

WebGPU é usado quando disponível; caso contrário o `WebGPURenderer` cai
automaticamente para WebGL2 (mesmos nodes TSL). O backend ativo aparece no
canto inferior esquerdo.

## Estado atual — M0 (personagem VAT) ✔

- EXRs do patch original em `public/vat/` (posições + normais, 1590×360:
  6 clipes × 60 frames). Clipes identificados: **0** idle · **1** andar ·
  **2** idle variação · **3** queda/morte · **4** levantar · **5** rezar.
- `src/vat/` — descriptor, loader e material TSL com vertex pulling por
  `vertexIndex`, lerp entre frames e calibração de eixos/normais via painel.
- Painel (leva) para: clipe 0–5, velocidade, pausa/scrub, base de eixos,
  inversão de linhas, offset de bake, modo de normais.

### Parâmetros de URL (para inspeção/screenshots)

`?clip=3&speed=1&pause=1&frame=30&basis=flipZ&rowsFlip=0&offset=1&flatNormals=1&showNormals=1&scale=1&leva=0`

### Screenshot headless (verificação)

```bash
npm run dev            # em um terminal
node scripts/screenshot.mjs "http://localhost:5199/?leva=0&clip=1" out.png
```

Requer Chrome instalado (usa `playwright-core` com `channel: "chrome"`).

## Próximos marcos (docs/03 §12)

- M1 — multidão instanciada (1.000+), offset de fase e cor por instância
- M2 — simulação compute (wander, separação via hash grid, contenção, mouse)
- M3 — data layer (`content/` fake com contrato do pipeline)
- M4+ — follow/beats, descoberta, constelação, polimento

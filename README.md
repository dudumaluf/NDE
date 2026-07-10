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

## Estado atual — M0 ✔ · morph seamless ✔ · M1 (multidão) ✔

- EXRs do patch original em `public/vat/` (posições + normais, 1590×360:
  6 clipes × 60 frames). Clipes: **0** idle · **1** andar · **2** idle
  variação · **3** morrer · **4** levantar · **5** rezar — a máquina de
  estados narrativa completa (doc 01 §4).
- `src/vat/` — sampler TSL com **crossfade A/B**: qualquer clipe morfa em
  qualquer outro fora de sequência, com lerp interframe; one-shots (morrer,
  levantar) seguram o último frame. `VatClipPlayer` dirige as transições
  (CPU) e o shader mistura as posições (GPU).
- `src/crowd/` — multidão em **1 draw call** (InstancedMesh + atributos por
  instância: posição, yaw, escala, cor, fase). Fase dessincroniza loops;
  one-shots disparam em sincronia (a "pausa coletiva" do doc 01 nasce aqui).
- Painel (leva): cena (multidão/personagem), botões de estado com morph,
  arco da história completo, fade, velocidade, grade/área/ruído/seed/paleta.

### Parâmetros de URL (para inspeção/screenshots)

- Cena e câmera: `?scene=multidao|personagem&cam=x,y,z&leva=0&forceWebGL=1`
- Multidão: `&grid=32&area=40`
- Estado congelado: `&pause=1&clip=3&frame=30`
- Morph congelado: `&clipA=1&frameA=30&clipB=3&frameB=40&blend=0.5`
- Arco automático: `&arc=1`

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

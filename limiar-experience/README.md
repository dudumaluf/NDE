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

## Deploy (protótipo online)

O protótipo está no ar em **https://limiar-prototipo.vercel.app** (Vercel,
plano Hobby — custo zero; projeto `limiar-prototipo`, sem domínio próprio).
URL discreta de propósito: `noindex` no HTML e `X-Robots-Tag` via
`vercel.json` — material sensível de pessoas reais, divulgação ampla só com
parceria do canal (doc 00 §4).

Para re-deployar quando o corpus ou o app evoluir:

```bash
npm run deploy       # = vercel build (roda npm run build local) + deploy do dist pronto
```

Detalhes que importam:

- O deploy é **prebuilt**: o build roda NESTA máquina (onde `acervo/export/`
  existe e o `sync-content` copia os JSONs frescos) e só o `dist/` (~31 MB)
  sobe. Deploy por git/CI não funcionaria hoje: `public/content/` e
  `public/vat/*/` são gitignorados e não existem no servidor.
- O link com o projeto Vercel vive em `.vercel/` (gitignorado). Em máquina
  nova: `npx vercel link --yes --project limiar-prototipo` uma vez.

## Áudio (a voz — Voz v1)

Os cortes de voz NÃO são servidos pelo Vercel: vivem no bucket público
`audio-cortes` do Supabase (projeto NDE `knqseuknuihqwlkfgesi`), re-encodados
de mp3 96k para **Opus mono 32 kbps** (~1/3 do tamanho; pipeline em
`scripts/audio-sync.mjs` — idempotente, re-rodável após cada lote do acervo;
exige abrir a policy temporária de escrita antes, ver doc 03 §14.8).

Resolução da BASE de URL dos cortes (em `src/audio/cuts.ts`):

1. `?audio=<base>` (query param — testes/overrides pontuais);
2. `VITE_AUDIO_BASE` (`.env`/`.env.local` — ambiente de build);
3. default: `https://knqseuknuihqwlkfgesi.supabase.co/storage/v1/object/public/audio-cortes`.

O app baixa `<base>/_index.json` (gerado pelo audio-sync) UMA vez para saber
quais cortes existem — ponto sem corte vira "sem áudio ainda" no hover, sem
404 no console. Clique num ponto da timeline do follow toca o corte
(crossfade na troca, ESC para, mute à direita dos modos da timeline).
Formato Opus/Ogg: Chrome/Edge/Firefox ok; Safari só ≥ 17.4 (macOS 14.4+) —
limitação aceita do protótipo.

## Estado atual — M0 ✔ · morph seamless ✔ · M1 (multidão) ✔ · M2 (simulação) ✔

- EXRs do patch original em `public/vat/` (posições + normais, 1590×360:
  6 clipes × 60 frames). Clipes: **0** idle · **1** andar · **2** idle
  variação · **3** morrer · **4** levantar · **5** rezar — a máquina de
  estados narrativa completa (doc 01 §4).
- `src/vat/` — sampler TSL com **crossfade A/B**: qualquer clipe morfa em
  qualquer outro fora de sequência, com lerp interframe; one-shots (morrer,
  levantar) seguram o último frame. `VatClipPlayer` dirige as transições
  (CPU) e o shader mistura as posições (GPU).
- `src/crowd/` — multidão em **1 draw call** (InstancedMesh; cor/escala como
  atributos estáticos). Posição, direção e fase do passo vêm da simulação.
- `src/sim/` — **simulação compute (TSL)** com estado por agente em storage
  buffers: wander por curl noise, **separação** (ninguém atravessa ninguém —
  o que o WebGL do patch não permitia), contenção suave no raio do Campo,
  mouse atrai/repele (raycast no chão), giro suave seguindo o movimento e
  **passo acoplado à velocidade real** (quem anda devagar pisa devagar).
  One-shots (morrer/levantar) continuam síncronos no beat coletivo.
  No fallback WebGL2 a separação desliga (transform feedback não dá acesso
  aleatório aos buffers); o resto da simulação roda igual.
- Painel (leva): cena (multidão/personagem), botões de estado com morph,
  arco da história completo, fade, velocidade, spawn (grade/área/ruído/seed/
  paleta) e simulação (velocidade, wander, separação, contenção, mouse,
  giro, passo, debug por cor).

### Parâmetros de URL (para inspeção/screenshots)

- Cena e câmera: `?scene=multidao|personagem&cam=x,y,z&leva=0&forceWebGL=1`
- Multidão: `&grid=32&area=40`
- Simulação: `&simT=8` (pré-roda 8 s — screenshots de estado assentado),
  `&mouse=off|atrair|repelir&mouseR=12`, `&sep=0` (separação off),
  `&contain=25`, `&speed2=1.2`, `&debug=velocidade|direção`, `&faceflip=1`
- Névoa: `&fogNear=100&fogFar=300` (útil em vistas de cima)
- Estado congelado: `&pause=1&clip=3&frame=30`
- Morph congelado: `&clipA=1&frameA=30&clipB=3&frameB=40&blend=0.5`
- Arco automático: `&arc=1`

### Screenshot headless (verificação)

```bash
npm run dev            # em um terminal
node scripts/screenshot.mjs "http://localhost:5199/?leva=0&clip=1" out.png
```

Requer Chrome instalado (usa `playwright-core` com `channel: "chrome"`).

### Personagens/animações próprios (VAT sem Houdini)

O **VAT Studio** (`npm run studio` → http://localhost:5198) é a interface
visual: arraste GLBs do Mixamo, veja o preview 3D, escolha loops/one-shots,
confira o orçamento (semáforo de vértices/textura/peso, redução de malha em
1 clique) e gere as texturas com validação automática. Para automação existe
a CLI `tools/vat-bake.mjs` (mesmo motor). Guia completo (export do Mixamo,
opções, limites): **[tools/README.md](tools/README.md)**.

```bash
node tools/vat-bake.mjs tools/fixtures/Soldier.glb --out public/vat/soldier \
  --skip TPose --selftest
# → http://localhost:5199/?vat=soldier&scene=personagem
```

## Próximos marcos (docs/03 §12)

- M3 — data layer (`content/` fake com contrato do pipeline)
- M4+ — follow/beats, descoberta, constelação, polimento

Nota de engenharia: a separação hoje é O(N²) na GPU (ok até 4096 agentes,
~60 fps). O upgrade para **spatial hash grid** (atômicos, WebGPU puro) entra
quando escalarmos além disso — decisão registrada no doc 03 §5.

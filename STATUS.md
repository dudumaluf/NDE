# STATUS — diário de bordo do projeto

> Este arquivo é a memória viva do projeto. Qualquer pessoa (ou agente de IA)
> em qualquer máquina deve conseguir retomar o trabalho lendo isto + os docs.
> **Ritual**: atualizar ao final de cada marco/sessão relevante, antes do push.

Última atualização: **2026-07-10** (fechamento do M2)

---

## Onde estamos

| Marco | O quê | Estado |
|---|---|---|
| Análise | Engenharia reversa completa do patch cables.gl (`Docs/ANALISE_TECNICA.md`) | ✔ |
| M0 | Base R3F + WebGPURenderer (fallback WebGL2), personagem VAT único animado, calibração de espaço | ✔ tag `m0` |
| M0.5 | **Morph seamless**: crossfade A/B entre quaisquer clipes, `VatClipPlayer`, botões de estado, arco da história | ✔ |
| M1 | Multidão instanciada (1 draw call, até 4096), cor/escala/fase por instância | ✔ tag `m1` |
| M2 | **Simulação compute**: wander (curl noise), separação (ninguém atravessa ninguém), contenção, mouse atrai/repele, giro suave, passo acoplado à velocidade | ✔ tag `m2` |
| M3 | Data layer (`content/` fake com o contrato do pipeline, doc 02 §10) | ⬅ **próximo** |
| M4+ | Follow/beats por agente, descoberta, constelação, polimento | pendente |
| `acervo` | Pipeline de dados real (transcrição/análise dos vídeos, doc 02) | não iniciado — pode abrir em paralelo ao M3 |

## Decisões tomadas (e porquês)

- **Stack**: React Three Fiber v9 + three r185 `WebGPURenderer` + TSL; Vite; leva para debug UI; screenshots headless via `playwright-core` + Chrome instalado.
- **Morph de animações é requisito central** (pedido do Dudu): qualquer estado
  morfa em qualquer outro fora de sequência, sem pop — implementado com dois
  slots (A/B) no shader e mix por `blend`.
- **Separação O(N²)** por enquanto (folgado até 4096 agentes). Upgrade para
  spatial hash grid com atômicos só quando quisermos 16k+ — registrado no
  README do app.
- **Fallback WebGL2**: simulação roda igual, exceto separação (transform
  feedback não tem acesso aleatório a buffers de vizinhos) — decisão
  antecipada no doc 03 §10.
- O patch cables é **referência técnica, não contrato de design** — o design
  que vale é o dos docs 00/01 (dito explicitamente pelo Dudu).
- Monorepo único no GitHub (`dudumaluf/NDE`) com histórico e tags preservados.

## Fatos técnicos verificados (nunca re-derivar)

Ver `limiar-experience/AGENTS.md` — lista canônica: 1590 vértices, VAT 6×60
frames, basis `x_negz_y`, bakeOffset empírico, normais cruas, ~18 fps de
playback, limite de 8 vertex buffers do WebGPU, etc.

## Pendências e questões abertas

- **Calibração de sensação no navegador real** (o Dudu ainda não validou o M2
  no próprio PC): velocidade, densidade, nervosismo do wander, raio do mouse —
  sliders todos no painel leva. FPS headless é enganoso (ambiente lento);
  medir no navegador de verdade.
- `faceFlip` default parece correto (pessoas de costas quando se afastam),
  mas conferir em movimento; há toggle no painel.
- Warning `THREE.Clock deprecated` no console — cosmético, ignorar.
- Docs duplicados: `Docs/` (raiz, canônico) e `limiar-experience/docs/`
  (espelho para quando se abre só a subpasta). Em caso de conflito, raiz vence.

## Como retomar numa máquina nova

1. Instalar: [Cursor](https://cursor.com), Git, Node 20+ (LTS), Google Chrome
   (usado pelos screenshots headless).
2. `git clone https://github.com/dudumaluf/NDE.git` e abrir a pasta no Cursor.
3. No terminal: `cd limiar-experience && npm install && npm run dev` →
   http://localhost:5199
4. Num chat novo do agente, colar:
   > Leia `AGENTS.md` (raiz) e siga a ordem de leitura de lá. Estamos no
   > estado descrito em `STATUS.md`. Continue de onde paramos.
5. O agente se reconstitui sozinho a partir dos docs — o conhecimento não
   vive em nenhum chat, vive no repositório.

## Ritual de sincronização entre PCs

- **Início de sessão**: `git pull` (pega o que o outro PC fez).
- **Fim de sessão**: atualizar este STATUS se algo relevante mudou →
  `git add -A && git commit && git push`. Nunca terminar com trabalho só local.
- Marcos continuam ganhando tag (`m3`, `m4`, …) + push com `--tags`.

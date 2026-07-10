# NDE / LIMIAR — instruções para agentes (raiz do monorepo)

Você está no monorepo do projeto LIMIAR: uma experiência interativa de
visualização de dados sobre experiências de quase morte (EQM/NDE), baseada
nos relatos do canal "Afinal, o que somos nós?". Fale com o Dudu em
**português brasileiro**.

## Ordem de leitura para se reconstituir (obrigatória em máquina/chat novo)

1. `STATUS.md` — onde estamos, decisões tomadas, próximos passos
2. `Docs/00-visao-geral.md` — norte, princípios, ética
3. `Docs/01-conceito-experiencia.md` — o design que o código serve
4. `Docs/04-experiencia-consumo.md` — decisões de UX mais recentes (estende e
   vence o 01 em caso de conflito)
5. `Docs/03-briefing-experiencia-3d.md` — arquitetura e marcos (com errata §1)
6. `Docs/ANALISE_TECNICA.md` — engenharia reversa do patch cables.gl original
7. `limiar-experience/AGENTS.md` — fatos técnicos verificados + método do app
8. `Docs/02-briefing-pipeline-dados.md` — só quando for trabalhar no `acervo`

(`Docs/05-dossie-curadoria.md` é apresentação externa — ler só se a tarefa
envolver curadoria/patrocínio.)

## Mapa do repositório

- `limiar-experience/` — o app (R3F + WebGPU/TSL). Tem AGENTS.md próprio.
- `Docs/` — documentação canônica (o espelho `limiar-experience/docs/` existe
  para quando só a subpasta é aberta; raiz vence em conflito).
- `cables-export/` — o patch cables.gl original exportado (referência
  imutável; não editar).
- `data/` — dados extraídos do patch (IDs de vídeos, nomes placeholder).

## Método de trabalho

- Implementar **por marcos** (doc 03 §12); commit + tag (`m0`, `m1`, …) ao
  fechar cada um; push com `--tags`.
- Verificação visual headless com screenshots (`limiar-experience/scripts/
  screenshot.mjs`) — sempre nos dois backends (WebGPU e `?forceWebGL=1`).
- **Atualizar `STATUS.md` ao final de cada marco/sessão** e dar push — é a
  memória compartilhada entre as máquinas do Dudu.
- `git pull` no início de qualquer sessão.

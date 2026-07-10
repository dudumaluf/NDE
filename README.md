# NDE — projeto LIMIAR

Experiência interativa de visualização de dados sobre **experiências de
quase-morte (EQM/NDE)**, baseada nos depoimentos do canal
[*Afinal, o que somos nós?*](https://www.youtube.com/@afinaloquesomosnos/videos):
centenas de relatos reais tomam forma como uma multidão viva em 3D, e o
visitante descobre, história por história, os padrões que as conectam.

## Estrutura do repositório

| Pasta | O que é |
|---|---|
| `Docs/` | Documentação do projeto: visão (00), conceito da experiência (01), briefing do pipeline de dados (02), briefing da experiência 3D (03) e análise técnica do patch original |
| `limiar-experience/` | **A experiência 3D** — React Three Fiber + WebGPU/TSL. Port e evolução do patch cables (VAT, morph de estados, multidão instanciada). Ver `limiar-experience/README.md` |
| `cables-export/` | O patch cables.gl original exportado (protótipo WebGL que provou a técnica) — abrir `index.html` |
| `data/` | Dados extraídos do patch: 136 IDs de vídeos do canal, 268 nomes placeholder, metadados da fonte |
| `acervo/` | *(futuro)* Pipeline de dados: scan → fetch → transcribe → extract → review → analyze → export (Doc 02) |

## Como rodar a experiência

```bash
cd limiar-experience
npm install
npm run dev   # http://localhost:5199
```

WebGPU quando disponível, fallback WebGL2 automático.

## Método de trabalho

Desenvolvimento por marcos (Doc 03 §12), um commit + tag por marco
(`m0`, `m1`, …). Agentes de IA: ler `limiar-experience/AGENTS.md` antes
de qualquer tarefa.

## Ética

Os relatos são testemunhos pessoais sobre morte, luto e transformação.
Corpus completo só com autorização/parceria do canal; tom contemplativo,
nunca sensacionalista. Ver `Docs/00-visao-geral.md` §4.

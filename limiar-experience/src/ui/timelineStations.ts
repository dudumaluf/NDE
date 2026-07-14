import type { PersonBeat, PersonDetail } from "../data/personStore";

/**
 * Estações canônicas da timeline (feedback do Dudu, 2026-07-14): em vez de
 * despejar TODOS os beats na linha ("item demais espremido"), o default
 * mostra a gramática COMUM das histórias — as mesmas estações, com os mesmos
 * nomes e na mesma ordem, para toda pessoa (só aparecem as presentes).
 *
 * Derivação a partir de `beats[].type` + `arc.virada`. Types reais do corpus
 * de 86 (não existem outros): contexto · evento_morte · eqm · retorno ·
 * integracao. Cobertura medida (85 pessoas com beats):
 *
 *   Antes         primeiro `contexto` (a vida antes)               85/85
 *   A morte       primeiro `evento_morte`                          74/85
 *   O outro lado  primeiro `eqm`                                   85/85
 *   A virada      beat apontado por arc.virada (é o ANEL)          82/85
 *   O retorno     primeiro `retorno` APÓS o primeiro eqm           78/85
 *   Depois        primeira `integracao` APÓS o retorno (ou eqm)    84/85
 *
 * As âncoras "após" são por `beat_index` (ordem narrativa) — sem elas,
 * histórias multi-parte quebrariam: ivy-ueno abre a parte 2 com beats de
 * integracao ANTES da EQM, e o primeiro `integracao` cru colocaria o
 * "Depois" no começo da linha.
 *
 * Virada que coincide com outra estação (33/82 são o primeiro beat de eqm)
 * não vira estação própria: a estação existente ganha o anel.
 */

export interface Station {
  /** Chave estável da estação (antes|morte|lado|virada|retorno|depois). */
  key: string;
  /** Rótulo do visitante (PT — caixa alta aplicada no render). */
  label: string;
  /** Beat representativo (posição na linha = t_norm dele). */
  beat: PersonBeat;
  /** Esta estação carrega o anel da virada do arco. */
  isVirada: boolean;
}

export function computeStations(person: PersonDetail): Station[] {
  const beats = person.beats;
  const first = (type: string, afterIndex = -1): PersonBeat | undefined =>
    beats.find((b) => b.type === type && b.beat_index > afterIndex);

  const antes = first("contexto");
  const morte = first("evento_morte");
  const lado = first("eqm");
  const retorno =
    first("retorno", lado?.beat_index ?? -1) ?? first("retorno");
  const anchor = retorno ?? lado;
  const depois =
    first("integracao", anchor?.beat_index ?? -1) ??
    [...beats].reverse().find((b) => b.type === "integracao");
  const virada =
    person.arc.virada !== null
      ? beats.find((b) => b.beat_index === person.arc.virada)
      : undefined;

  // A virada por último: se cair num beat que já é estação, ela vira o anel
  // daquela estação (o rótulo do momento vence, o anel marca a virada).
  const defs: [string, string, PersonBeat | undefined][] = [
    ["antes", "Antes", antes],
    ["morte", "A morte", morte],
    ["lado", "O outro lado", lado],
    ["retorno", "O retorno", retorno],
    ["depois", "Depois", depois],
    ["virada", "A virada", virada],
  ];

  const out: Station[] = [];
  for (const [key, label, beat] of defs) {
    if (!beat) continue;
    const dup = out.find((s) => s.beat.beat_index === beat.beat_index);
    if (dup) {
      if (key === "virada") dup.isVirada = true;
      continue;
    }
    out.push({ key, label, beat, isVirada: key === "virada" });
  }
  // Linha lê da esquerda para a direita: x = posição real na entrevista.
  return out.sort((a, b) => a.beat.t_norm - b.beat.t_norm);
}

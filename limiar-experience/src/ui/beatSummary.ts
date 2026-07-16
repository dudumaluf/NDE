/**
 * Texto de hover/resumo na timeline — tira o boilerplate da vinheta do canal
 * que a extração costuma colocar no beat `contexto` ("Apresentação do canal…").
 * Só afeta a EXIBIÇÃO; o JSON do acervo fica intacto.
 */

const CHANNEL_PREFIX =
  /^(?:vinheta do canal|apresentação do canal|introdução do canal|abertura do canal)[:\s,—-]*/i;

const STRIP_RULES: RegExp[] = [
  /^e\s+introdução\s+(?:ao caso de|à|ao)\s+/i,
  /^introdução\s+(?:ao caso de|da depoente|do depoente)\s+/i,
  /^e\s+apresentação\s+/i,
  /^apresentação\s+(?:inicial\s+)?(?:do entrevistador carlos\.?\s*)?/i,
  /^apresentação\s+(?:do caso de|da entrevistada|do depoente|de|da|do)\s+/i,
  /^apresentando\s+(?:a\s+)?(?:segunda|terceira|quarta)\s+parte\s+da\s+entrevista\s+(?:com\s+|de\s+)?/i,
  /^apresentação:\s*/i,
];

function stripChannelNoise(summary: string): string {
  let s = summary.trim();
  s = s.replace(CHANNEL_PREFIX, "");
  for (const rule of STRIP_RULES) {
    s = s.replace(rule, "");
  }
  s = s.replace(/\s+/g, " ").trim().replace(/^[,.—-]+\s*/, "");
  if (s.length > 0) s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

const MIN_USEFUL = 28;

/**
 * Resumo legível para tooltip/hover. Beats que não são `contexto` passam
 * direto; no contexto, limpa vinheta e cai no one_liner da pessoa se sobrou
 * pouco texto (partes 2/3, vinheta só com "Carlos.", etc.).
 */
export function displayBeatSummary(
  summary: string,
  beatType: string,
  personOneLiner?: string | null,
): string {
  const raw = summary.trim();
  if (beatType !== "contexto") return raw;

  const cleaned = stripChannelNoise(raw);
  if (cleaned.length >= MIN_USEFUL) return cleaned;

  const fallback = personOneLiner?.trim();
  if (fallback && fallback.length >= MIN_USEFUL) return fallback;
  if (cleaned.length > 0) return cleaned;
  return fallback || raw;
}

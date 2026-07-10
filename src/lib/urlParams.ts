/**
 * Parâmetros de debug via URL (?clip=3&basis=flipZ&...) — permitem inspecionar
 * a cena de forma automatizada (screenshots) sem mexer na UI.
 */
function get(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

export function qpHas(name: string): boolean {
  return new URLSearchParams(window.location.search).has(name);
}

export function qpNum(name: string, def: number): number {
  const v = get(name);
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) ? n : def;
}

export function qpStr<T extends string>(name: string, def: T, allowed?: readonly T[]): T {
  const v = get(name) as T | null;
  if (v === null) return def;
  if (allowed && !allowed.includes(v)) return def;
  return v;
}

export function qpBool(name: string, def: boolean): boolean {
  const v = get(name);
  if (v === null) return def;
  return v === "1" || v === "true";
}

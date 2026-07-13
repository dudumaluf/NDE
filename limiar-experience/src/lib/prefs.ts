/**
 * Preferências persistentes do painel (pedido do Dudu, 2026-07-12): os valores
 * do leva "grudam" entre reloads via localStorage.
 *
 * Formato do blob (o tuning.json do doc 03 §4.6 — export/import idênticos):
 *   { app: "limiar-tuning", version: 1, savedAt: ISO, values: { "<path leva>": valor } }
 *
 * Regras:
 *  - merge POR CHAVE e tolerante: chave salva que não existe mais é ignorada;
 *    controle novo sem valor salvo usa o default de fábrica; tipo divergente
 *    (controle mudou de number→select entre versões) cai no default.
 *  - precedência no boot: query param > salvo > fábrica — cada default é
 *    lido via pref() e os qp*() existentes embrulham por fora, então URLs de
 *    screenshot continuam 100% reproduzíveis.
 *  - `version` guarda o formato do BLOB (não dos valores) — migrações futuras
 *    penduram aqui.
 */

import { qpBool, qpHas, qpNum, qpStr } from "./urlParams";

export const PREFS_VERSION = 1;
const STORAGE_KEY = "limiar.tuning";

export interface PrefsBlob {
  app: "limiar-tuning";
  version: number;
  savedAt: string;
  values: Record<string, unknown>;
}

function isBlob(j: unknown): j is PrefsBlob {
  const b = j as PrefsBlob | null;
  return Boolean(
    b &&
      b.app === "limiar-tuning" &&
      typeof b.version === "number" &&
      b.values &&
      typeof b.values === "object" &&
      !Array.isArray(b.values),
  );
}

let cache: PrefsBlob | null | undefined;

/** Blob salvo (parse 1×, cacheado — pref() roda dezenas de vezes no boot). */
export function savedBlob(): PrefsBlob | null {
  if (cache === undefined) {
    cache = null;
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      if (t) {
        const j: unknown = JSON.parse(t);
        if (isBlob(j)) cache = j;
        else console.warn("[prefs] blob salvo inválido — usando fábrica");
      }
    } catch {
      cache = null;
    }
  }
  return cache;
}

/**
 * Default efetivo de um controle: valor salvo (se existir, com o MESMO tipo
 * do default de fábrica e dentro de `allowed`, quando dado) ou a fábrica.
 */
export function pref<T extends string | number | boolean>(
  path: string,
  def: T,
  allowed?: readonly T[],
): T {
  const b = savedBlob();
  if (!b) return def;
  const v = b.values[path];
  if (typeof v !== typeof def) return def;
  if (allowed && !allowed.includes(v as T)) return def;
  return v as T;
}

/**
 * Variantes com query param NA FRENTE (screenshots reproduzíveis): se o
 * parâmetro está na URL ele vence o salvo; sem ele, vale salvo > fábrica.
 */
export function prefNum(qp: string, path: string, def: number): number {
  return qpHas(qp) ? qpNum(qp, def) : pref(path, def);
}

export function prefBool(qp: string, path: string, def: boolean): boolean {
  return qpHas(qp) ? qpBool(qp, def) : pref(path, def);
}

export function prefStr<T extends string>(
  qp: string,
  path: string,
  def: T,
  allowed?: readonly T[],
): T {
  return qpHas(qp) ? qpStr(qp, def, allowed) : pref(path, def, allowed);
}

/** Grava os valores como novo padrão. Devolve o blob (null se quota/erro). */
export function savePrefs(values: Record<string, unknown>): PrefsBlob | null {
  const blob: PrefsBlob = {
    app: "limiar-tuning",
    version: PREFS_VERSION,
    savedAt: new Date().toISOString(),
    values,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    cache = blob;
    return blob;
  } catch {
    return null;
  }
}

/** Apaga o padrão salvo (volta à fábrica no próximo boot). */
export function clearPrefs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* privado/quota — segue */
  }
  cache = null;
}

/** Blob → texto de export (o conteúdo do tuning.json). */
export function blobToText(blob: PrefsBlob): string {
  return JSON.stringify(blob, null, 2);
}

/**
 * Texto importado → blob validado. Aceita versão ≤ atual (tolerância por
 * chave protege o resto); lança Error com mensagem legível se inválido.
 */
export function parseBlobText(text: string): PrefsBlob {
  let j: unknown;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error("não é JSON válido");
  }
  if (!isBlob(j)) throw new Error('não é um tuning do LIMIAR (app "limiar-tuning")');
  if (j.version > PREFS_VERSION) {
    console.warn(
      `[prefs] blob de versão ${j.version} > ${PREFS_VERSION} — importando por chave, tolerante`,
    );
  }
  return j;
}

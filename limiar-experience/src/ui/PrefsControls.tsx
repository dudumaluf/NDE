import { button, levaStore, useControls } from "leva";
import {
  blobToText,
  clearPrefs,
  parseBlobText,
  savePrefs,
} from "../lib/prefs";

/**
 * Grupo "Preferências" do leva (pedido do Dudu, 2026-07-12): o painel
 * inteiro vira preset persistente.
 *
 *  - salvar como padrão → serializa TODOS os valores atuais do leva
 *    (toggles, sliders, dropdowns, cores — todos os grupos) num blob
 *    versionado no localStorage; no próximo boot cada controle nasce com o
 *    valor salvo (query param na URL continua vencendo — screenshots
 *    reproduzíveis);
 *  - restaurar fábrica → apaga o salvo e recarrega (os defaults do código
 *    voltam a valer);
 *  - exportar → clipboard + download de `tuning.json` (doc 03 §4.6);
 *  - importar → colar o JSON na caixa e aplicar: vale na hora (set no
 *    levaStore) e já persiste como novo padrão.
 *
 * Merge por chave e tolerante: chave salva que não existe mais é ignorada;
 * controle novo usa a fábrica; tipo divergente cai na fábrica (ver prefs.ts).
 */

/** Snapshot de todos os inputs de VALOR do leva (fora botões e este grupo). */
function collectLevaValues(): Record<string, unknown> {
  const data = levaStore.getData();
  const out: Record<string, unknown> = {};
  for (const [path, item] of Object.entries(data)) {
    if (path.startsWith("Preferências.")) continue;
    if ("value" in item) out[path] = (item as { value: unknown }).value;
  }
  return out;
}

// Ganchos p/ teste headless (scripts/prefs-probe.mjs): salvar e ler o painel
// sem clicar nos botões do leva.
if (import.meta.env.DEV && typeof window !== "undefined") {
  const w = window as unknown as Record<string, unknown>;
  w.__limiarPrefsCollect = collectLevaValues;
  w.__limiarPrefsSave = () => savePrefs(collectLevaValues());
}

function download(name: string, text: string): void {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function PrefsControls() {
  const [, set] = useControls(
    "Preferências",
    () => ({
      "salvar como padrão": button(() => {
        const values = collectLevaValues();
        const blob = savePrefs(values);
        set({
          status: blob
            ? `salvo ✓ ${Object.keys(values).length} valores — grudam no reload`
            : "falhou (localStorage cheio/bloqueado)",
        });
      }),
      "restaurar fábrica": button(() => {
        clearPrefs();
        location.reload();
      }),
      "exportar (clipboard + arquivo)": button(() => {
        const blob = savePrefs(collectLevaValues());
        if (!blob) {
          set({ status: "falhou (localStorage cheio/bloqueado)" });
          return;
        }
        const text = blobToText(blob);
        download("tuning.json", text);
        navigator.clipboard
          ?.writeText(text)
          .then(() => set({ status: "exportado ✓ clipboard + tuning.json" }))
          .catch(() => set({ status: "exportado ✓ tuning.json (clipboard negado)" }));
      }),
      colar: {
        value: "",
        label: "importar: colar JSON",
        rows: 3,
      },
      importar: button((get) => {
        const text = String(get("Preferências.colar") ?? "").trim();
        if (!text) {
          set({ status: "cole o JSON exportado na caixa acima" });
          return;
        }
        try {
          const blob = parseBlobText(text);
          savePrefs(blob.values);
          // Aplica na hora: paths desconhecidos são ignorados pelo leva
          // (try/catch por chave dentro do set) — merge tolerante.
          levaStore.set(blob.values, false);
          set({
            status: `importado ✓ ${Object.keys(blob.values).length} valores (já é o padrão)`,
            colar: "",
          });
        } catch (e) {
          set({ status: `inválido: ${(e as Error).message}` });
        }
      }),
      status: { value: "—", label: "status", editable: false },
    }),
    { collapsed: true },
  );

  return null;
}

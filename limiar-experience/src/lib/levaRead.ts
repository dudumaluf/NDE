import { levaStore } from "leva";

/**
 * Leitura imperativa de um valor do leva por PATH ("Grupo.key"). Os
 * componentes da camada de hierarquia (ClusterOutlines/DataViewDiscs) vivem
 * fora do CrowdMesh (para não editá-lo — território da Multidão) mas precisam
 * de alguns parâmetros que moram nos grupos dele (mapScale, grid, gravity…).
 * Ler é seguro (nunca escrevemos aqui); chamado no useFrame, valores mudam
 * raro. Mesmo padrão de levaStore.getData() do PrefsControls.
 */
export function levaVal<T extends string | number | boolean>(
  path: string,
  def: T,
): T {
  const data = levaStore.getData() as Record<string, { value?: unknown }>;
  const item = data[path];
  if (item && "value" in item && typeof item.value === typeof def) {
    return item.value as T;
  }
  return def;
}

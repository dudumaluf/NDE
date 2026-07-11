import { useMemo } from "react";
import * as THREE from "three/webgpu";
import { useLoader } from "@react-three/fiber";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { binToTexture, vat } from "./runtime";

/**
 * Carrega o par de texturas da VAT (posições + normais) como DataTextures
 * float, configuradas para leitura exata por texel (textureLoad, sem filtro).
 * Duas codificações: EXR float32 (asset legado do Houdini) e .bin float16 raw
 * (saída do tools/vat-bake.mjs, doc 03 §3) — decidido pelo descriptor ativo.
 */
export function useVatTextures(): [THREE.Texture, THREE.Texture] {
  const v = vat();
  const isExr = v.encoding === "exr";
  // O encoding é fixo pela URL (?vat=) durante toda a vida do app — a escolha
  // de loader é estável entre renders (regra dos hooks preservada).
  const [rawPos, rawNrm] = useLoader(
    (isExr ? EXRLoader : THREE.FileLoader) as typeof EXRLoader,
    [v.positionsUrl, v.normalsUrl],
    (loader) => {
      if (isExr) (loader as EXRLoader).setDataType(THREE.FloatType);
      else (loader as unknown as THREE.FileLoader).setResponseType("arraybuffer");
    },
  );

  return useMemo(() => {
    const pair = (
      isExr
        ? [rawPos, rawNrm]
        : [
            binToTexture(rawPos as unknown as ArrayBuffer),
            binToTexture(rawNrm as unknown as ArrayBuffer),
          ]
    ) as [THREE.Texture, THREE.Texture];
    for (const tex of pair) {
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
    }
    return pair;
  }, [rawPos, rawNrm, isExr]);
}

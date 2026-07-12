import { useMemo } from "react";
import * as THREE from "three/webgpu";
import { useLoader } from "@react-three/fiber";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { binToTexture, vat, vatB } from "./runtime";

/**
 * Carrega o par de texturas da VAT (posições + normais) como DataTextures
 * float, configuradas para leitura exata por texel (textureLoad, sem filtro).
 * Duas codificações: EXR float32 (asset legado do Houdini) e .bin float16 raw
 * (saída do tools/vat-bake.mjs, doc 03 §3) — decidido pelo descriptor ativo.
 *
 * Com `?vatB=` (morph entre texturas), os bins da VAT B também são baixados
 * e empilhados abaixo dos da A na MESMA DataTexture (binToTexture) — o
 * sampler endereça os clipes de B por linha, sem bindings extras.
 */
export function useVatTextures(): [THREE.Texture, THREE.Texture] {
  const v = vat();
  const b = vatB();
  const isExr = v.encoding === "exr";
  // URLs fixas pela URL da página (?vat=/&vatB=) durante toda a vida do app —
  // a lista é estável entre renders (regra dos hooks preservada).
  const urls =
    !isExr && b
      ? [v.positionsUrl, v.normalsUrl, b.positionsUrl, b.normalsUrl]
      : [v.positionsUrl, v.normalsUrl];
  const raws = useLoader(
    (isExr ? EXRLoader : THREE.FileLoader) as typeof EXRLoader,
    urls,
    (loader) => {
      if (isExr) (loader as EXRLoader).setDataType(THREE.FloatType);
      else (loader as unknown as THREE.FileLoader).setResponseType("arraybuffer");
    },
  );

  return useMemo(() => {
    const [rawPos, rawNrm, rawPosB, rawNrmB] = raws as unknown[];
    const pair = (
      isExr
        ? [rawPos, rawNrm]
        : [
            binToTexture(rawPos as ArrayBuffer, rawPosB as ArrayBuffer | undefined, "positions"),
            binToTexture(rawNrm as ArrayBuffer, rawNrmB as ArrayBuffer | undefined, "normals"),
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
  }, [raws, isExr]);
}

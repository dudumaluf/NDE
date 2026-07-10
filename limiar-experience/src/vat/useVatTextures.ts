import { useMemo } from "react";
import * as THREE from "three/webgpu";
import { useLoader } from "@react-three/fiber";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { VAT } from "./descriptor";

/**
 * Carrega o par de EXRs da VAT (posições + normais) como DataTextures float,
 * configuradas para leitura exata por texel (textureLoad, sem filtragem).
 */
export function useVatTextures(): [THREE.Texture, THREE.Texture] {
  const [positions, normals] = useLoader(
    EXRLoader,
    [VAT.positionsUrl, VAT.normalsUrl],
    (loader) => (loader as EXRLoader).setDataType(THREE.FloatType),
  );

  return useMemo(() => {
    for (const tex of [positions, normals]) {
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.colorSpace = THREE.NoColorSpace;
      tex.needsUpdate = true;
    }
    return [positions, normals];
  }, [positions, normals]);
}

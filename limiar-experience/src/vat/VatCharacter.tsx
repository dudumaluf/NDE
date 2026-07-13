import { useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { vat } from "./runtime";
import { buildSoupGeometry } from "./vatGeometry";
import { buildCharacterMaterial } from "./characterMaterial";
import { useVatTextures } from "./useVatTextures";
import { vatPlayer } from "./VatClipPlayer";
import { hasRootMotion, rootMotionOffset } from "./rootMotion";
import { pref, prefBool } from "../lib/prefs";

/** Personagem único — palco da demo de morph entre estados (e entre VATs). */
export function VatCharacter() {
  const [posTex, nrmTex] = useVatTextures();
  const meshRef = useRef<THREE.Mesh>(null);
  const bundle = useMemo(
    () => buildCharacterMaterial(posTex, nrmTex),
    [posTex, nrmTex],
  );
  const geometry = useMemo(
    () => buildSoupGeometry(vat().vertexCount, vat().indices),
    [],
  );

  const withRootMotion = useMemo(hasRootMotion, []);
  const c = useControls("Personagem", {
    escala: { value: pref("Personagem.escala", 2.5), min: 0.1, max: 5 },
    rootMotion: {
      // ?rootMotion=0 desliga (screenshots determinísticos do antes/depois)
      value: prefBool("rootMotion", "Personagem.rootMotion", true),
      label: "root motion (translate)",
      hint: "aplica a trajetória exportada pelo bake in-place como translate do mesh — para one-shots dirigidos; a multidão ignora (movimento vem da simulação)",
      render: () => withRootMotion,
    },
  });

  useFrame(() => {
    const state = vatPlayer.getState();
    bundle.sampler.applyState(state);
    bundle.setScale(c.escala);
    const mesh = meshRef.current;
    if (mesh) {
      if (withRootMotion && c.rootMotion) {
        // mesma escala que o material aplica às posições da VAT
        mesh.position.copy(rootMotionOffset(state)).multiplyScalar(c.escala);
      } else {
        mesh.position.set(0, 0, 0);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={bundle.material}
      frustumCulled={false}
    />
  );
}

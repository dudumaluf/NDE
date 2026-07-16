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
import { pref, prefBool, prefNum } from "../lib/prefs";

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
  const c = useControls("Character", {
    escala: { value: pref("Character.escala", 2.5), min: 0.1, max: 5, label: "scale" },
    pivotX: {
      value: prefNum("pivotX", "Field · physics.pivotX", 0),
      min: -1,
      max: 1,
      step: 0.01,
      label: "pivot X",
      hint: "same as Field · physics — baked VAT units",
    },
    pivotZ: {
      value: prefNum("pivotZ", "Field · physics.pivotZ", 0),
      min: -1,
      max: 1,
      step: 0.01,
      label: "pivot Z",
    },
    rootMotion: {
      // ?rootMotion=0 desliga (screenshots determinísticos do antes/depois)
      value: prefBool("rootMotion", "Character.rootMotion", true),
      label: "root motion (translate)",
      hint: "applies the trajectory exported by the in-place bake as a mesh translate — for driven one-shots; the crowd ignores it (movement comes from the simulation)",
      render: () => withRootMotion,
    },
  });

  useFrame(() => {
    const state = vatPlayer.getState();
    bundle.sampler.applyState(state);
    bundle.setScale(c.escala);
    bundle.setPivot(c.pivotX, c.pivotZ);
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

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { vat } from "./runtime";
import { buildSoupGeometry } from "./vatGeometry";
import { buildCharacterMaterial } from "./characterMaterial";
import { useVatTextures } from "./useVatTextures";
import { vatPlayer } from "./VatClipPlayer";

/** Personagem único — palco da demo de morph entre estados. */
export function VatCharacter() {
  const [posTex, nrmTex] = useVatTextures();
  const bundle = useMemo(
    () => buildCharacterMaterial(posTex, nrmTex),
    [posTex, nrmTex],
  );
  const geometry = useMemo(
    () => buildSoupGeometry(vat().vertexCount, vat().indices),
    [],
  );

  const c = useControls("Personagem", {
    escala: { value: 2.5, min: 0.1, max: 5 },
  });

  useFrame(() => {
    bundle.sampler.applyState(vatPlayer.getState());
    bundle.setScale(c.escala);
  });

  return (
    <mesh geometry={geometry} material={bundle.material} frustumCulled={false} />
  );
}

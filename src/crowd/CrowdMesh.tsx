import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { VAT } from "../vat/descriptor";
import { buildCrowdGeometry } from "../vat/vatGeometry";
import { useVatTextures } from "../vat/useVatTextures";
import { vatPlayer } from "../vat/VatClipPlayer";
import { buildCrowdMaterial } from "./crowdMaterial";
import { fillSpawn } from "./spawn";
import { qpNum } from "../lib/urlParams";

const MAX_GRID = 64; // 4096 pessoas — teto do protótipo M1

export function CrowdMesh() {
  const [posTex, nrmTex] = useVatTextures();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, attrs } = useMemo(
    () => buildCrowdGeometry(VAT.vertexCount, MAX_GRID * MAX_GRID),
    [],
  );
  const bundle = useMemo(
    () => buildCrowdMaterial(posTex, nrmTex, attrs),
    [posTex, nrmTex, attrs],
  );

  const c = useControls("Multidão", {
    grid: {
      value: Math.min(qpNum("grid", 32), MAX_GRID),
      min: 4,
      max: MAX_GRID,
      step: 4,
      label: "grade (N×N)",
    },
    area: { value: qpNum("area", 40), min: 10, max: 80, label: "área" },
    ruido: { value: 0.6, min: 0, max: 2, label: "ruído de spawn" },
    seed: { value: 3, min: 1, max: 9999, step: 1 },
    escala: { value: 2.5, min: 0.5, max: 5, label: "escala pessoa" },
    paleta: { value: true, label: "cores (vs. dormentes)" },
  });

  // Identidade no instanceMatrix (o node de instancing multiplica por ele;
  // toda a transformação real vem dos atributos custom).
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < MAX_GRID * MAX_GRID; i++) mesh.setMatrixAt(i, m);
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useEffect(() => {
    const count = fillSpawn(attrs, {
      grid: c.grid,
      area: c.area,
      noise: c.ruido,
      seed: c.seed,
    });
    if (meshRef.current) meshRef.current.count = count;
  }, [attrs, c.grid, c.area, c.ruido, c.seed]);

  useFrame(() => {
    bundle.sampler.applyState(vatPlayer.getState());
    bundle.setScale(c.escala);
    bundle.setPaletteAmount(c.paleta ? 1 : 0);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, bundle.material, MAX_GRID * MAX_GRID]}
      frustumCulled={false}
    />
  );
}

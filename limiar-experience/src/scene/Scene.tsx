import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import { VatCharacter } from "../vat/VatCharacter";
import { CrowdMesh } from "../crowd/CrowdMesh";
import { StateButtons } from "../ui/StateButtons";
import { PlayerBridge } from "./PlayerBridge";
import { qpStr } from "../lib/urlParams";

export const SCENE_MODES = ["multidao", "personagem"] as const;
export type SceneMode = (typeof SCENE_MODES)[number];

export function initialSceneMode(): SceneMode {
  return qpStr<SceneMode>("scene", "multidao", SCENE_MODES);
}

/**
 * Cena compartilhada: chão + grid (eco do patch), luzes neutras, fog cinza
 * herdado do ClearColor 0.427. Dois modos: multidão (M1) e personagem
 * (demo de morph M0.5) — os botões de estado valem para ambos.
 */
export function Scene() {
  const { modo } = useControls("Cena", {
    modo: { value: initialSceneMode(), options: [...SCENE_MODES] },
  });

  return (
    <>
      <color attach="background" args={["#6d6d6d"]} />
      <fog attach="fog" args={["#6d6d6d", 14, 55]} />

      <hemisphereLight args={["#d8dde6", "#46413c", 1.0]} />
      <directionalLight position={[4, 6, 3]} intensity={1.7} color="#fff1de" />
      <directionalLight position={[-5, 3, -4]} intensity={0.45} color="#9fb4ff" />

      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color="#616161" roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper
        args={[42.5, 170, "#7c7c7c", "#686868"]}
        position-y={0.002}
      />

      <PlayerBridge />
      <StateButtons />
      {modo === "personagem" ? <VatCharacter /> : <CrowdMesh />}

      <OrbitControls
        makeDefault
        enableDamping
        target={modo === "personagem" ? [0, 0.85, 0] : [0, 0.6, 0]}
        maxPolarAngle={Math.PI * 0.495}
      />
    </>
  );
}

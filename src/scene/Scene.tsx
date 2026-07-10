import { OrbitControls } from "@react-three/drei";
import { VatCharacter } from "../vat/VatCharacter";

/**
 * Cena M0: chão + grid (eco do patch: grid 170 linhas, espaçamento 0.25),
 * luzes neutras, fog cinza herdado do ClearColor 0.427 do patch.
 */
export function Scene() {
  return (
    <>
      <color attach="background" args={["#6d6d6d"]} />
      <fog attach="fog" args={["#6d6d6d", 12, 46]} />

      <hemisphereLight args={["#d8dde6", "#46413c", 1.0]} />
      <directionalLight position={[4, 6, 3]} intensity={1.7} color="#fff1de" />
      <directionalLight position={[-5, 3, -4]} intensity={0.45} color="#9fb4ff" />

      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#616161" roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper
        args={[42.5, 170, "#7c7c7c", "#686868"]}
        position-y={0.002}
      />

      <VatCharacter />

      <OrbitControls
        makeDefault
        enableDamping
        target={[0, 0.85, 0]}
        maxPolarAngle={Math.PI * 0.495}
      />
    </>
  );
}

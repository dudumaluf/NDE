import { useMemo } from "react";
import * as THREE from "three/webgpu";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import { VatCharacter } from "../vat/VatCharacter";
import { CrowdMesh } from "../crowd/CrowdMesh";
import { StateButtons } from "../ui/StateButtons";
import { PlayerBridge } from "./PlayerBridge";
import { mouseTarget } from "../sim/mouseTarget";
import { qpStr } from "../lib/urlParams";
import { pref } from "../lib/prefs";
import { useAppearance } from "../ui/appearanceStore";

export const SCENE_MODES = ["multidao", "personagem"] as const;
export type SceneMode = (typeof SCENE_MODES)[number];

export function initialSceneMode(): SceneMode {
  // qp `scene` > padrão salvo (grupo Preferences) > fábrica.
  const saved = pref<SceneMode>("Scene.modo", "multidao", SCENE_MODES);
  return qpStr<SceneMode>("scene", saved, SCENE_MODES);
}

/**
 * Cena compartilhada: chão + grid (eco do patch), luzes neutras. Dois modos:
 * multidão (M1) e personagem (demo de morph M0.5) — os botões de estado
 * valem para ambos.
 *
 * Cores do mundo (fundo/céu, chão, grid) vêm do grupo "Aparência" do leva
 * (useAppearance). A NÉVOA inteira (de altura E a linear clássica) é
 * propriedade do PostFX desde 2026-07-12 — o toggle master de lá liga/
 * desliga de verdade; aqui não se declara mais `<fog>`.
 */
export function Scene() {
  const { modo } = useControls("Scene", {
    modo: {
      value: initialSceneMode(),
      // Valores internos (e ?scene=) seguem PT; rótulos EN só no painel.
      options: { crowd: "multidao", character: "personagem" } as Record<
        string,
        SceneMode
      >,
      label: "mode",
    },
  });

  const fundo = useAppearance((s) => s.fundo);
  const chao = useAppearance((s) => s.chao);
  const gridCor = useAppearance((s) => s.gridCor);
  const gridAlpha = useAppearance((s) => s.gridAlpha);

  // GridHelper assa as duas cores em vertex colors no construtor — mudar cor
  // exige remontar (key). Mantém a razão original entre linha central e as
  // demais (#7c7c7c → #686868 ≈ ×0.84).
  const gridSecundaria = useMemo(
    () => "#" + new THREE.Color(gridCor).multiplyScalar(0.84).getHexString(),
    [gridCor],
  );

  return (
    <>
      <color attach="background" args={[fundo]} />

      <hemisphereLight args={["#d8dde6", "#46413c", 1.0]} />
      <directionalLight position={[4, 6, 3]} intensity={1.7} color="#fff1de" />
      <directionalLight position={[-5, 3, -4]} intensity={0.45} color="#9fb4ff" />

      <mesh
        rotation-x={-Math.PI / 2}
        onPointerMove={(e) => {
          mouseTarget.point.copy(e.point);
        }}
      >
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color={chao} roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper
        key={`${gridCor}-${gridAlpha < 1}`}
        args={[42.5, 170, gridCor, gridSecundaria]}
        position-y={0.002}
        visible={gridAlpha > 0.004}
        material-transparent={gridAlpha < 1}
        material-opacity={gridAlpha}
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

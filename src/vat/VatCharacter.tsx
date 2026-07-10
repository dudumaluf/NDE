import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { BASIS_NAMES, VAT, basisMatrix, type BasisName } from "./descriptor";
import { buildSoupGeometry, buildVatMaterial } from "./vatMaterial";
import { useVatTextures } from "./useVatTextures";
import { qpBool, qpNum, qpStr } from "../lib/urlParams";

const FPS = VAT.framesPerClip / VAT.clipSeconds; // ≈ 18 fps, paridade com o patch

export function VatCharacter() {
  const [posTex, nrmTex] = useVatTextures();
  const bundle = useMemo(() => buildVatMaterial(posTex, nrmTex), [posTex, nrmTex]);
  const geometry = useMemo(() => buildSoupGeometry(VAT.vertexCount), []);
  const timeRef = useRef(qpNum("frame", 0) / FPS);

  const c = useControls("VAT", {
    clip: {
      value: qpNum("clip", 1),
      min: 0,
      max: VAT.clipCount - 1,
      step: 1,
      label: "clipe (0–5)",
    },
    speed: { value: qpNum("speed", 1), min: 0, max: 3, label: "velocidade" },
    pause: { value: qpBool("pause", false), label: "pausar" },
    scrub: {
      value: qpNum("frame", 0),
      min: 0,
      max: VAT.framesPerClip - 0.01,
      label: "frame (pausado)",
    },
    scale: { value: qpNum("scale", 2.5), min: 0.1, max: 5, label: "escala" },
    basis: {
      value: qpStr<BasisName>("basis", "x_negz_y", BASIS_NAMES),
      options: [...BASIS_NAMES],
      label: "base (eixos)",
    },
    rowsFlip: { value: qpBool("rowsFlip", false), label: "inverter linhas" },
    applyOffset: { value: qpBool("offset", true), label: "aplicar offset bake" },
    flatNormals: { value: qpBool("flatNormals", true), label: "normais flat" },
    normalMode: {
      value: qpStr("normalMode", "raw-offset", ["raw-offset", "x2-1", "raw"] as const),
      options: ["raw-offset", "x2-1", "raw"],
      label: "decode normal tex",
    },
    flipNormals: { value: qpBool("flipNormals", false), label: "virar normais" },
    showNormals: { value: qpBool("showNormals", false), label: "ver normais (cor)" },
  });

  useFrame((_, delta) => {
    if (!c.pause) timeRef.current += delta * c.speed;

    const u = bundle.uniforms;
    u.frame.value = c.pause
      ? c.scrub
      : (timeRef.current * FPS) % VAT.framesPerClip;
    u.clipBase.value = c.clip * VAT.framesPerClip;
    u.rowsFlip.value = c.rowsFlip ? 1 : 0;
    u.basis.value.copy(basisMatrix(c.basis as BasisName));
    const off = c.applyOffset ? VAT.bakeOffset : ([0, 0, 0] as const);
    u.offset.value.set(off[0], off[1], off[2]);
    u.scale.value = c.scale;
    u.useFlatNormal.value = c.flatNormals ? 1 : 0;
    u.normalMode.value = c.normalMode === "raw-offset" ? 0 : c.normalMode === "x2-1" ? 1 : 2;
    u.normalFlip.value = c.flipNormals ? -1 : 1;
    u.showNormals.value = c.showNormals ? 1 : 0;
  });

  return (
    <mesh
      geometry={geometry}
      material={bundle.material}
      frustumCulled={false}
    />
  );
}

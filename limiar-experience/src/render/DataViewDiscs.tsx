/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import {
  float,
  instanceIndex,
  instancedBufferAttribute,
  length,
  oneMinus,
  smoothstep,
  storage,
  uniform,
  uv,
  vec3,
} from "three/tsl";
import type { Content } from "../data/types";
import { fillContentAttributes } from "../crowd/spawn";
import { positionMirror } from "../sim/positionMirror";
import { useFocusReading } from "../ui/focusReadingStore";
import { levaVal } from "../lib/levaRead";

type N = any;

/**
 * LOD "vista de dados" (2026-07-14, doc 04): acima de uma ALTURA de câmera as
 * pessoas fazem crossfade para DISCOS achatados no chão — a leitura
 * circle-packing do corpus inteiro. Um só instanced mesh (1 draw call), com
 * as posições lidas do MESMO storage buffer da sim que os fios usam (storage
 * read-only + setPBO(true) — zero tráfego CPU↔GPU por frame). O disco é um
 * quad no plano XZ com um círculo suave no fragment (smoothstep TSL).
 *
 * COR DOS DISCOS (dívida documentada): o buffer de cor da multidão
 * (iColorScale) é atributo do mesh dentro do CrowdMesh, que NÃO editamos
 * (território da Multidão). Então reconstruímos a cor por pessoa/dormente com
 * as MESMAS funções puras de spawn.ts/palette.ts (determinístico pela seed —
 * `fillContentAttributes` no nosso próprio atributo). v1 não reflete HSB
 * global nem o destaque/lente do CrowdMesh; é a cor de núcleo/dormente.
 *
 * CROSSFADE: os discos aparecem POR CIMA (fade-in por altura); a multidão
 * real continua (de longe já é minúscula) — fazê-la sumir exigiria tocar o
 * material dela (ticket para a Multidão depois). Montado em App.tsx.
 *
 * O `sim` vem do positionMirror.simRef (o hover/follow do CrowdMesh já
 * registram a sim lá) — assim lemos o storage sem tocar no CrowdMesh.
 */

const MAX_GRID = 64;
const MAX_COUNT = MAX_GRID * MAX_GRID;
/** Raio-base do disco (m) antes da variação por pessoa e do slider. */
const BASE_RADIUS = 0.62;
/** Altura sobre o chão (m) — acima dos fios, some junto do terreno. */
const LIFT = 0.04;

interface Built {
  mesh: THREE.InstancedMesh;
  colorAttr: THREE.InstancedBufferAttribute;
  uMix: N;
  uSize: N;
  material: THREE.MeshBasicNodeMaterial;
}

export function DataViewDiscs({ content }: { content: Content }) {
  const groupRef = useRef<THREE.Group>(null);
  const builtRef = useRef<Built | null>(null);
  const camera = useThree((s) => s.camera);

  const dataView = useFocusReading((s) => s.dataView);
  const discSize = useFocusReading((s) => s.discSize);
  const dataViewHeight = useFocusReading((s) => s.dataViewHeight);
  const dataViewBand = useFocusReading((s) => s.dataViewBand);

  const mix = useRef(0);

  // Reconstrói as cores quando o content muda (seed lida no momento).
  const fillColors = (attr: THREE.InstancedBufferAttribute) => {
    const seed = levaVal("Field · physics.seed", 3);
    fillContentAttributes({ colorScale: attr }, MAX_COUNT, seed, content);
    attr.needsUpdate = true;
  };

  useEffect(() => {
    if (builtRef.current) fillColors(builtRef.current.colorAttr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    return () => {
      const b = builtRef.current;
      if (b) {
        b.mesh.geometry.dispose();
        b.material.dispose();
      }
      builtRef.current = null;
    };
  }, []);

  useFrame(() => {
    // Constrói tardiamente: precisa da sim (via positionMirror), que o
    // hover/follow do CrowdMesh registram no primeiro frame com content.
    if (!builtRef.current) {
      const sim = positionMirror.simRef;
      const group = groupRef.current;
      if (!sim || !group) return;

      const geometry = new THREE.PlaneGeometry(1, 1);
      const colorAttr = new THREE.InstancedBufferAttribute(
        new Float32Array(MAX_COUNT * 4),
        4,
      );
      geometry.setAttribute("iDiscColor", colorAttr);

      const material = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const iPos: N = storage(sim.positions.value, "vec3", sim.maxCount)
        .setPBO(true)
        .toReadOnly()
        .element(instanceIndex);
      const aCS: N = instancedBufferAttribute(colorAttr);
      const uSize: N = uniform(1);
      const uMix: N = uniform(0);

      // Quad → círculo no plano XZ. uv 0..1 vira XZ centrado; raio = escala
      // por pessoa (aCS.w) × slider × base.
      const uvN: N = uv();
      const radius: N = aCS.w.mul(uSize).mul(BASE_RADIUS);
      const local: N = vec3(uvN.x.sub(0.5), 0, uvN.y.sub(0.5)).mul(radius);
      material.positionNode = local.add(
        vec3(iPos.x, iPos.y.add(LIFT), iPos.z),
      );

      material.colorNode = aCS.xyz;
      // Círculo suave: distância radial no quad (0 centro → 1 no meio da
      // borda); apaga do 0,82 até a borda. × crossfade por altura.
      const d: N = length(uvN.sub(0.5)).mul(2);
      const circle: N = oneMinus(smoothstep(0.82, 1.0, d));
      material.opacityNode = circle.mul(uMix).mul(float(0.92));

      const mesh = new THREE.InstancedMesh(geometry, material, MAX_COUNT);
      mesh.frustumCulled = false;
      mesh.count = 0;
      // instanceMatrix em identidade (a posição vem toda do positionNode).
      const m = new THREE.Matrix4();
      for (let i = 0; i < MAX_COUNT; i++) mesh.setMatrixAt(i, m);
      mesh.instanceMatrix.needsUpdate = true;

      builtRef.current = { mesh, colorAttr, uMix, uSize, material };
      fillColors(colorAttr);
      group.add(mesh);
    }

    const b = builtRef.current;
    if (!b) return;

    // Crossfade por altura da câmera (fade-in dos discos acima do limiar).
    const camY = camera.position.y;
    const target =
      dataView
        ? Math.max(
            0,
            Math.min(
              1,
              (camY - (dataViewHeight - dataViewBand)) / Math.max(dataViewBand, 1e-3),
            ),
          )
        : 0;
    mix.current += (target - mix.current) * 0.15;
    b.uMix.value = mix.current;
    b.uSize.value = discSize;

    // Desenha só os agentes ativos (grid atual) — os além de count têm
    // posição obsoleta. Invisível quando o crossfade está zerado.
    const grid = levaVal("Field · physics.grid", 32);
    const count = Math.min(grid * grid, MAX_COUNT);
    b.mesh.count = mix.current > 0.004 ? count : 0;

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarDataView = {
        camY: Number(camY.toFixed(1)),
        mix: Number(mix.current.toFixed(3)),
        count: b.mesh.count,
      };
    }
  });

  return <group ref={groupRef} />;
}

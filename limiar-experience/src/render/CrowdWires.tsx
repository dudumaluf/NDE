/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import { attribute, int, storage, uniform, vec3 } from "three/tsl";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";

type N = any;

/**
 * Fios do grafo (doc 03 §4.5): LineSegments com um vértice por ponta de
 * aresta. A posição NÃO vive na geometria — cada vértice carrega o índice do
 * agente (aAgent) e o vertex shader busca a posição viva no storage buffer da
 * CrowdSim. Os fios seguem as pessoas sem nenhum tráfego CPU→GPU por frame.
 *
 * Backends: em WebGPU o buffer é lido como storage read-only no vertex stage;
 * no fallback WebGL2 o mesmo nó com setPBO(true) vira textura (PBO) que o
 * backend re-copia após cada compute — mesmo código TSL, dois caminhos.
 *
 * Alpha por aresta = uAlpha × weight (peso do grafo, 0.09–0.92 no corpus 46).
 */

export interface WireUniforms {
  setAlpha(v: number): void;
  setLift(v: number): void;
}

export function buildWiresObject(
  sim: CrowdSim,
  content: Content,
): { object: THREE.LineSegments; uniforms: WireUniforms; edgeCount: number } {
  const people = content.manifest.people;
  const slotByPerson = new Map<string, number>();
  people.forEach((p, i) => slotByPerson.set(p.id, i));

  const edges = content.graph.edges.filter(
    (e) => slotByPerson.has(e.source) && slotByPerson.has(e.target),
  );

  const nVerts = edges.length * 2;
  const agentIdx = new Float32Array(nVerts);
  const weights = new Float32Array(nVerts);
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    agentIdx[i * 2 + 0] = slotByPerson.get(e.source)!;
    agentIdx[i * 2 + 1] = slotByPerson.get(e.target)!;
    weights[i * 2 + 0] = e.weight;
    weights[i * 2 + 1] = e.weight;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(nVerts * 3), 3),
  );
  geometry.setAttribute("aAgent", new THREE.BufferAttribute(agentIdx, 1));
  geometry.setAttribute("aWeight", new THREE.BufferAttribute(weights, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e5);

  // Nó storage próprio sobre o MESMO atributo da sim: read-only no vertex
  // stage; setPBO habilita o caminho por textura do fallback WebGL2.
  const livePositions: N = storage(
    (sim.positions as N).value,
    "vec3",
    sim.maxCount,
  )
    .setPBO(true)
    .toReadOnly();

  const uAlpha: N = uniform(0.22);
  const uLift: N = uniform(1.05);

  const material = new THREE.LineBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });
  const aAgent: N = attribute("aAgent", "float");
  const aWeight: N = attribute("aWeight", "float");
  const agentPos: N = livePositions.element(int(aAgent));
  material.positionNode = agentPos.add(vec3(0, 1, 0).mul(uLift));
  material.colorNode = vec3(0.82, 0.8, 0.78);
  material.opacityNode = uAlpha.mul(aWeight);

  const object = new THREE.LineSegments(geometry, material);
  object.frustumCulled = false;

  return {
    object,
    uniforms: {
      setAlpha: (v) => {
        uAlpha.value = v;
      },
      setLift: (v) => {
        uLift.value = v;
      },
    },
    edgeCount: edges.length,
  };
}

/** Wrapper React: monta/desmonta os fios quando o content chega. */
export function CrowdWires({
  sim,
  content,
  visible,
  alpha,
  lift,
}: {
  sim: CrowdSim;
  content: Content;
  visible: boolean;
  alpha: number;
  lift: number;
}) {
  const built = useMemo(() => buildWiresObject(sim, content), [sim, content]);

  useEffect(() => {
    built.uniforms.setAlpha(alpha);
    built.uniforms.setLift(lift);
  }, [built, alpha, lift]);

  return <primitive object={built.object} visible={visible} />;
}

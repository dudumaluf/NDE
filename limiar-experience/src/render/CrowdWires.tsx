/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import {
  attribute,
  float,
  int,
  length,
  mix,
  pow,
  smoothstep,
  storage,
  uniform,
  varying,
  vec3,
} from "three/tsl";
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
 * Leitura visual (M3.5) — "vivo mas não confuso":
 *  - alpha por DISTÂNCIA entre os endpoints (perto = vivo, longe = some):
 *    smoothstep(uFadeNear→uFadeFar), contínuo por frame — sem pop;
 *  - "peso" da aresta module COR e ALPHA (curva de gama ajustável).
 *    LIMITAÇÃO documentada: LineSegments não tem espessura real em nenhum
 *    backend moderno (WebGPU e WebGL2 rasterizam linhas com 1px); espessura
 *    de verdade = quads instanciados/Line2, mas o Line2NodeMaterial monta os
 *    endpoints a partir de atributos instanciados próprios — casar isso com
 *    endpoints vivos em storage exigiria reescrever o material inteiro (v2);
 *  - modo "só núcleos formados": o fio só acende quando OS DOIS endpoints
 *    estão perto dos seus alvos (coesão). Os alvos são conhecidos na CPU
 *    (sim.targetsArray) e mudam raramente → entram como atributos
 *    (aTgtA/aTgtB, re-preenchidos a cada computeTargets), não como storage —
 *    evita um segundo PBO no fallback WebGL2.
 */

export interface WireUniforms {
  setAlpha(v: number): void;
  setLift(v: number): void;
  setFade(near: number, far: number): void;
  setWeightGamma(v: number): void;
  setOnlyFormed(on: boolean): void;
  setCohesionRadius(v: number): void;
}

export interface WiresBuild {
  object: THREE.LineSegments;
  uniforms: WireUniforms;
  edgeCount: number;
  /** Re-preenche os alvos por vértice (chamar após cada computeTargets). */
  refreshTargets(targetsArray: Float32Array): void;
}

export function buildWiresObject(sim: CrowdSim, content: Content): WiresBuild {
  const people = content.manifest.people;
  const slotByPerson = new Map<string, number>();
  people.forEach((p, i) => slotByPerson.set(p.id, i));

  const edges = content.graph.edges.filter(
    (e) => slotByPerson.has(e.source) && slotByPerson.has(e.target),
  );

  const nVerts = edges.length * 2;
  const agentIdx = new Float32Array(nVerts);
  const otherIdx = new Float32Array(nVerts);
  const weights = new Float32Array(nVerts);
  const slotA = new Int32Array(edges.length);
  const slotB = new Int32Array(edges.length);
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const a = slotByPerson.get(e.source)!;
    const b = slotByPerson.get(e.target)!;
    slotA[i] = a;
    slotB[i] = b;
    agentIdx[i * 2 + 0] = a;
    agentIdx[i * 2 + 1] = b;
    otherIdx[i * 2 + 0] = b;
    otherIdx[i * 2 + 1] = a;
    weights[i * 2 + 0] = e.weight;
    weights[i * 2 + 1] = e.weight;
  }

  // Alvo do PRÓPRIO agente do vértice (aTgtA) e do agente da outra ponta
  // (aTgtB), como vec3(x, z, tem-alvo) — preenchidos por refreshTargets().
  const tgtSelf = new Float32Array(nVerts * 3);
  const tgtOther = new Float32Array(nVerts * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(nVerts * 3), 3),
  );
  geometry.setAttribute("aAgent", new THREE.BufferAttribute(agentIdx, 1));
  geometry.setAttribute("aOther", new THREE.BufferAttribute(otherIdx, 1));
  geometry.setAttribute("aWeight", new THREE.BufferAttribute(weights, 1));
  geometry.setAttribute("aTgtA", new THREE.BufferAttribute(tgtSelf, 3));
  geometry.setAttribute("aTgtB", new THREE.BufferAttribute(tgtOther, 3));
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
  const uFadeNear: N = uniform(6);
  const uFadeFar: N = uniform(14);
  const uGamma: N = uniform(1.6);
  const uOnlyFormed: N = uniform(1);
  const uCohesion: N = uniform(3);

  const material = new THREE.LineBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });
  const aAgent: N = attribute("aAgent", "float");
  const aOther: N = attribute("aOther", "float");
  const aWeight: N = attribute("aWeight", "float");
  const aTgtA: N = attribute("aTgtA", "vec3");
  const aTgtB: N = attribute("aTgtB", "vec3");

  const pSelf: N = livePositions.element(int(aAgent));
  const pOther: N = livePositions.element(int(aOther));

  // Fade por distância entre as pontas: perto = vivo, longe = some.
  const span: N = length(pSelf.xz.sub(pOther.xz));
  const distFade: N = float(1).sub(smoothstep(uFadeNear, uFadeFar, span));

  // Coesão de uma ponta: 1 quando o agente está sobre o seu alvo, 0 a partir
  // do raio uCohesion (×w do alvo: agente sem alvo nunca conta como coeso).
  const cohesion = (p: N, t: N): N =>
    float(1)
      .sub(smoothstep(uCohesion.mul(0.55), uCohesion, length(p.xz.sub(t.xy))))
      .mul(t.z);
  const formedGate: N = mix(
    float(1),
    cohesion(pSelf, aTgtA).mul(cohesion(pOther, aTgtB)),
    uOnlyFormed,
  );

  // "Espessura" percebida: peso → curva de gama → clareia a cor e soma alpha.
  const w: N = pow(aWeight, uGamma);

  material.positionNode = pSelf.add(vec3(0, 1, 0).mul(uLift));
  material.colorNode = mix(vec3(0.5, 0.485, 0.46), vec3(0.99, 0.965, 0.9), w);
  // CRÍTICO: o alpha PRECISA ser avaliado no vertex stage (varying). No
  // fragment, aAgent/aOther chegam INTERPOLADOS ao longo da linha — int()
  // deles indexaria agentes intermediários aleatórios e o fio esfarela
  // ("fios desconectados"). Como span e coesão são iguais nas duas pontas
  // da aresta, o varying interpola um valor constante — fio inteiro, firme.
  material.opacityNode = varying(uAlpha.mul(w).mul(distFade).mul(formedGate));

  const object = new THREE.LineSegments(geometry, material);
  object.frustumCulled = false;

  const refreshTargets = (targetsArray: Float32Array): void => {
    for (let i = 0; i < edges.length; i++) {
      const a = slotA[i];
      const b = slotB[i];
      const ax = targetsArray[a * 4 + 0];
      const az = targetsArray[a * 4 + 2];
      const aw = targetsArray[a * 4 + 3];
      const bx = targetsArray[b * 4 + 0];
      const bz = targetsArray[b * 4 + 2];
      const bw = targetsArray[b * 4 + 3];
      // vértice 0: self=a, other=b · vértice 1: self=b, other=a
      tgtSelf.set([ax, az, aw, bx, bz, bw], i * 6);
      tgtOther.set([bx, bz, bw, ax, az, aw], i * 6);
    }
    (geometry.getAttribute("aTgtA") as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute("aTgtB") as THREE.BufferAttribute).needsUpdate = true;
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarWires = {
        tgtHead: Array.from(tgtSelf.slice(0, 6)).map((v) => Number(v.toFixed(2))),
        refreshedAt: Date.now(),
      };
    }
  };
  refreshTargets(sim.targetsArray);

  return {
    object,
    uniforms: {
      setAlpha: (v) => {
        uAlpha.value = v;
      },
      setLift: (v) => {
        uLift.value = v;
      },
      setFade: (near, far) => {
        uFadeNear.value = near;
        uFadeFar.value = Math.max(far, near + 0.01);
      },
      setWeightGamma: (v) => {
        uGamma.value = v;
      },
      setOnlyFormed: (on) => {
        uOnlyFormed.value = on ? 1 : 0;
      },
      setCohesionRadius: (v) => {
        uCohesion.value = v;
      },
    },
    edgeCount: edges.length,
    refreshTargets,
  };
}

/** Wrapper React: monta/desmonta os fios quando o content chega. */
export function CrowdWires({
  sim,
  content,
  visible,
  alpha,
  lift,
  fadeNear,
  fadeFar,
  weightGamma,
  onlyFormed,
  cohesionRadius,
  targetsVersion,
}: {
  sim: CrowdSim;
  content: Content;
  visible: boolean;
  alpha: number;
  lift: number;
  fadeNear: number;
  fadeFar: number;
  weightGamma: number;
  onlyFormed: boolean;
  cohesionRadius: number;
  /** Incrementado pelo dono dos alvos a cada computeTargets. */
  targetsVersion: number;
}) {
  const built = useMemo(() => buildWiresObject(sim, content), [sim, content]);

  useEffect(() => {
    built.uniforms.setAlpha(alpha);
    built.uniforms.setLift(lift);
    built.uniforms.setFade(fadeNear, fadeFar);
    built.uniforms.setWeightGamma(weightGamma);
    built.uniforms.setOnlyFormed(onlyFormed);
    built.uniforms.setCohesionRadius(cohesionRadius);
  }, [built, alpha, lift, fadeNear, fadeFar, weightGamma, onlyFormed, cohesionRadius]);

  useEffect(() => {
    built.refreshTargets(sim.targetsArray);
  }, [built, sim, targetsVersion]);

  return <primitive object={built.object} visible={visible} />;
}

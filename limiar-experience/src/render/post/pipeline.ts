/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  clamp,
  float,
  length,
  pass,
  renderOutput,
  screenUV,
  smoothstep,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { ao } from "three/addons/tsl/display/GTAONode.js";
import { fxaa } from "three/addons/tsl/display/FXAANode.js";

type N = any;

/**
 * Pipeline de pós-processamento (three RenderPipeline + nodes TSL).
 *
 * Efeitos como módulos toggáveis. O grafo (pass de cena → AO → bloom →
 * vinheta) é RECRIADO a cada mudança de flags: os nodes antigos são
 * dispostos e novos nascem já com a configuração certa de render target.
 * Recompilação única por troca (hitch de ms), zero custo residual — efeito
 * desligado não existe no grafo, não roda nem um pass.
 *
 * Decisões de orçamento (pedido do Dudu: bonito e barato):
 * - bloom: BloomNode do three (mips ½..1/32 internos), threshold ALTO por
 *   padrão — só os realces de cor dos agentes respiram luz; o cinza do
 *   Campo nunca estoura.
 * - AO: GTAO em MEIA resolução, 8 amostras (vs 16 default), normais
 *   reconstruídas da depth (sem MRT — mais barato e igual nos 2 backends).
 *   Sem denoise: com a multidão em movimento o padrão de ruído fica abaixo
 *   do ruído visual da cena; denoise dobraria o custo do efeito.
 * - vinheta: TSL no próprio quad final (zero pass extra, ~grátis).
 * - SSR/SSGI: descartados de projeto — caros (ray-march por pixel) e a cena
 *   não tem materiais refletivos/GI dinâmica que os justifiquem (chão fosco
 *   roughness 0.95, agentes foscos, névoa cobrindo o longe).
 *
 * Antialiasing — a parte sutil:
 * - Sem AO, o pass da cena roda com MSAA 4× (resolve de COR funciona nos
 *   dois backends; bloom/vinheta leem só a cor resolvida).
 * - O GTAO precisa LER a depth do pass, e depth multisampled não é legível
 *   no WebGPU (GPUValidationError textureDimensions(texture_depth_
 *   multisampled_2d)). Com AO ligado o pass nasce com samples=0 e um FXAA
 *   fecha a cadeia em espaço sRGB (renderOutput + outputColorTransform
 *   false). O custo medido do "AO" embute o FXAA — é o preço real da
 *   escolha, exibido honestamente.
 */

export interface PipelineFlags {
  bloom: boolean;
  ao: boolean;
  vinheta: boolean;
}

export interface PostPipelineHandle {
  /** Renderiza o frame pelo pipeline (usar no lugar de renderer.render). */
  render(): void;
  /** Recompõe o grafo se as flags mudaram. Devolve true se recompôs. */
  setFlags(f: PipelineFlags): boolean;
  /** true se algum efeito de pipeline está ativo (senão, render direto). */
  isActive(): boolean;
  setBloomStrength(v: number): void;
  setBloomThreshold(v: number): void;
  setBloomRadius(v: number): void;
  setVignetteAmount(v: number): void;
  setAoRadius(v: number): void;
  dispose(): void;
}

export function buildPostPipeline(
  renderer: THREE.WebGPURenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): PostPipelineHandle {
  const pipeline = new THREE.RenderPipeline(renderer);

  // Uniforms sobrevivem às recomposições (sliders não recompilam nada).
  const uBloomStrength: N = uniform(0.35);
  const uBloomRadius: N = uniform(0.35);
  const uBloomThreshold: N = uniform(0.72);
  const uVigAmount: N = uniform(0.55);
  const uAoRadius = { value: 0.5 }; // GTAO tem uniform próprio; espelho CPU

  const flags: PipelineFlags = { bloom: false, ao: false, vinheta: false };
  let composed = false;

  // Nodes vivos do grafo atual (para dispose na recomposição).
  let scenePass: N = null;
  let bloomNode: N = null;
  let aoNode: N = null;

  function disposeGraph(): void {
    bloomNode?.dispose?.();
    aoNode?.dispose?.();
    scenePass?.dispose?.();
    bloomNode = null;
    aoNode = null;
    scenePass = null;
  }

  function compose(): void {
    disposeGraph();

    // MSAA 4× sem AO; com AO a depth precisa ser legível → samples 0 + FXAA.
    scenePass = (pass as N)(scene, camera, { samples: flags.ao ? 0 : 4 });
    const scenePassColor: N = scenePass.getTextureNode("output");

    let color: N = scenePassColor;

    if (flags.ao) {
      const scenePassDepth: N = scenePass.getTextureNode("depth");
      aoNode = (ao as N)(scenePassDepth, null, camera);
      aoNode.resolutionScale = 0.5;
      aoNode.samples.value = 8;
      aoNode.thickness.value = 1;
      aoNode.radius.value = uAoRadius.value;
      const aoTex: N = aoNode.getTextureNode();
      color = color.mul(vec4(vec3(aoTex.r), 1));
    }
    if (flags.bloom) {
      bloomNode = (bloom as N)(
        scenePassColor,
        uBloomStrength,
        uBloomRadius,
        uBloomThreshold,
      );
      color = color.add(bloomNode);
    }
    if (flags.vinheta) {
      // Distância radial do centro → máscara suave que escurece as bordas
      // sem tocar o miolo da cena.
      const d: N = length(screenUV.sub(0.5).mul(2));
      const mask: N = smoothstep(float(0.62), float(1.62), d).mul(uVigAmount);
      color = vec4(color.rgb.mul(clamp(float(1).sub(mask), 0, 1)), color.a);
    }

    if (flags.ao) {
      pipeline.outputColorTransform = false;
      pipeline.outputNode = (fxaa as N)((renderOutput as N)(color));
    } else {
      pipeline.outputColorTransform = true;
      pipeline.outputNode = color;
    }
    pipeline.needsUpdate = true;
    composed = true;
  }

  return {
    render: () => {
      if (!composed) compose();
      pipeline.render();
    },
    setFlags: (f) => {
      const changed =
        f.bloom !== flags.bloom || f.ao !== flags.ao || f.vinheta !== flags.vinheta;
      if (changed) {
        flags.bloom = f.bloom;
        flags.ao = f.ao;
        flags.vinheta = f.vinheta;
        compose();
      }
      return changed;
    },
    isActive: () => flags.bloom || flags.ao || flags.vinheta,
    setBloomStrength: (v) => {
      uBloomStrength.value = v;
    },
    setBloomThreshold: (v) => {
      uBloomThreshold.value = v;
    },
    setBloomRadius: (v) => {
      uBloomRadius.value = v;
    },
    setVignetteAmount: (v) => {
      uVigAmount.value = v;
    },
    setAoRadius: (v) => {
      uAoRadius.value = v;
      if (aoNode) aoNode.radius.value = v;
    },
    dispose: () => {
      disposeGraph();
      pipeline.dispose();
    },
  };
}

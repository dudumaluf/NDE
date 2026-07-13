import { Suspense, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva } from "leva";
import { Scene, initialSceneMode } from "./scene/Scene";
import { PostFX } from "./render/post/PostFX";
import { qpBool, qpStr } from "./lib/urlParams";
import { useContent } from "./data/contentStore";
import { useDemoLens } from "./data/demoLensStore";
import { DEMO_LENS_LABELS } from "./data/demoLens";
import { cssColor } from "./data/palette";

/** Legenda da lente demográfica ativa: categoria → contagem, com a cor viva. */
function DemoLensLegend() {
  const cls = useDemoLens((s) => s.cls);
  if (!cls) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 10,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "4px 14px",
        maxWidth: "70vw",
        padding: "6px 14px",
        borderRadius: 6,
        background: "rgba(0,0,0,0.45)",
        color: "#ddd",
        fontSize: 12,
        pointerEvents: "none",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ color: "#a8a49d" }}>{DEMO_LENS_LABELS[cls.lens]}</span>
      {cls.categories
        .filter((cat) => cat.count > 0)
        .map((cat) => (
          <span key={cat.key} style={{ whiteSpace: "nowrap" }}>
            <span
              style={{
                display: "inline-block",
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: cssColor(cat.color),
                marginRight: 5,
                verticalAlign: "baseline",
              }}
            />
            {cat.label} {cat.count}
          </span>
        ))}
    </div>
  );
}

/** Sinaliza prontidão (2 frames), detecta o backend e mede FPS médio. */
function Probe({
  onReady,
  onFps,
}: {
  onReady: (backend: string) => void;
  onFps: (fps: number) => void;
}) {
  const frames = useRef(0);
  const done = useRef(false);
  const acc = useRef({ t: 0, n: 0 });

  useFrame((state, delta) => {
    frames.current += 1;
    if (!done.current && frames.current >= 2) {
      done.current = true;
      const gl = state.gl as unknown as {
        backend?: { isWebGPUBackend?: boolean };
      };
      const backend = gl.backend?.isWebGPUBackend ? "WebGPU" : "WebGL2 (fallback)";
      onReady(backend);
      const w = window as unknown as Record<string, unknown>;
      w.__limiarBackend = backend;
      w.__limiarReady = true;
    }
    const a = acc.current;
    a.t += delta;
    a.n += 1;
    if (a.t >= 0.5) {
      const fps = a.n / a.t;
      onFps(fps);
      (window as unknown as Record<string, unknown>).__limiarFps = fps;
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

function initialCamera(): [number, number, number] {
  const cam = qpStr<string>("cam", "");
  if (cam) {
    const parts = cam.split(",").map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
      return parts as [number, number, number];
    }
  }
  return initialSceneMode() === "personagem" ? [2.6, 1.7, 3.4] : [14, 9, 18];
}

export default function App() {
  const [backend, setBackend] = useState<string | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const showUi = qpBool("leva", true);
  const content = useContent((s) => s.content);

  return (
    <>
      <Leva
        hidden={!showUi}
        collapsed={false}
        titleBar={{ title: "LIMIAR — debug" }}
        theme={{ sizes: { rootWidth: "380px", controlWidth: "170px" } }}
      />
      <Canvas
        camera={{ position: initialCamera(), fov: 45, near: 0.05, far: 300 }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer({
            ...(props as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
            antialias: true,
            forceWebGL: qpBool("forceWebGL", false),
            // GPU timestamps p/ medir o custo real dos efeitos (menu Effects);
            // sem suporte (feature/extensão ausente) cai no frame-time.
            trackTimestamp: true,
          });
          await renderer.init();
          return renderer;
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <PostFX />
          <Probe onReady={setBackend} onFps={setFps} />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: "fixed",
          left: 10,
          bottom: 10,
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(0,0,0,0.45)",
          color: "#ddd",
          fontSize: 12,
          pointerEvents: "none",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {backend ? `render: ${backend}` : "inicializando renderer…"}
        {fps !== null ? ` · ${fps.toFixed(0)} fps` : ""}
      </div>
      <DemoLensLegend />
      {content && (
        <div
          style={{
            position: "fixed",
            right: 10,
            bottom: 10,
            padding: "4px 10px",
            borderRadius: 6,
            background: "rgba(0,0,0,0.45)",
            color: "#cfcac2",
            fontSize: 12,
            pointerEvents: "none",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {content.manifest.counts.people} pessoas ·{" "}
          {content.clusters.length} núcleos · manifest{" "}
          {content.manifest.content_hash.slice(0, 8)}
        </div>
      )}
    </>
  );
}

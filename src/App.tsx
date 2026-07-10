import { Suspense, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva } from "leva";
import { Scene } from "./scene/Scene";
import { qpBool } from "./lib/urlParams";

/** Sinaliza prontidão (2 frames renderizados) e detecta o backend em uso. */
function Probe({ onReady }: { onReady: (backend: string) => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame((state) => {
    frames.current += 1;
    if (done.current || frames.current < 2) return;
    done.current = true;
    const gl = state.gl as unknown as {
      backend?: { isWebGPUBackend?: boolean };
    };
    const backend = gl.backend?.isWebGPUBackend ? "WebGPU" : "WebGL2 (fallback)";
    onReady(backend);
    const w = window as unknown as Record<string, unknown>;
    w.__limiarBackend = backend;
    w.__limiarReady = true;
  });
  return null;
}

export default function App() {
  const [backend, setBackend] = useState<string | null>(null);
  const showUi = qpBool("leva", true);

  return (
    <>
      <Leva hidden={!showUi} collapsed={false} titleBar={{ title: "LIMIAR — debug M0" }} />
      <Canvas
        camera={{ position: [2.6, 1.7, 3.4], fov: 45, near: 0.05, far: 300 }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer({
            ...(props as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
            antialias: true,
            forceWebGL: qpBool("forceWebGL", false),
          });
          await renderer.init();
          return renderer;
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Probe onReady={setBackend} />
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
        }}
      >
        {backend ? `render: ${backend}` : "inicializando renderer…"}
      </div>
    </>
  );
}

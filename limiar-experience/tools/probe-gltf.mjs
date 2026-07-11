// Probe descartável: GLTFLoader roda em Node com GLB sanitizado (sem texturas)?
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function sanitizeGlb(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("não é GLB");
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen)));
  delete json.images;
  delete json.textures;
  delete json.samplers;
  json.materials = [];
  for (const m of json.meshes ?? [])
    for (const p of m.primitives) delete p.material;
  let jsonText = JSON.stringify(json);
  while (new TextEncoder().encode(jsonText).length % 4 !== 0) jsonText += " ";
  const jsonBytes = new TextEncoder().encode(jsonText);
  const rest = buf.subarray(20 + jsonLen); // chunks restantes (BIN)
  const total = 12 + 8 + jsonBytes.length + rest.length;
  const out = new Uint8Array(total);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, 0x46546c67, true);
  odv.setUint32(4, 2, true);
  odv.setUint32(8, total, true);
  odv.setUint32(12, jsonBytes.length, true);
  odv.setUint32(16, 0x4e4f534a, true);
  out.set(jsonBytes, 20);
  out.set(rest, 20 + jsonBytes.length);
  return out.buffer;
}

const buf = readFileSync(process.argv[2] ?? "tools/fixtures/Soldier.glb");
const glb = sanitizeGlb(buf);
const gltf = await new Promise((res, rej) =>
  new GLTFLoader().parse(glb, "", res, rej),
);
console.log("parse ok");
gltf.scene.updateMatrixWorld(true);
gltf.scene.traverse((o) => {
  if (o.isSkinnedMesh) {
    const g = o.geometry;
    console.log(
      `skinned "${o.name}": verts=${g.attributes.position.count} index=${g.index ? g.index.count : "none"} bones=${o.skeleton.bones.length}`,
    );
    console.log("  matrixWorld:", o.matrixWorld.elements.map((v) => +v.toFixed(3)).join(","));
  }
});
for (const c of gltf.animations)
  console.log(`clip "${c.name}": dur=${c.duration.toFixed(3)}s tracks=${c.tracks.length}`);

// sanity de pose: samplear Idle t=0.5 e medir bounds do primeiro skinned mesh
const mesh = (() => {
  let m = null;
  gltf.scene.traverse((o) => { if (!m && o.isSkinnedMesh) m = o; });
  return m;
})();
const mixer = new THREE.AnimationMixer(gltf.scene);
const clip = gltf.animations.find((a) => a.name === "Idle") ?? gltf.animations[0];
const action = mixer.clipAction(clip);
action.setLoop(THREE.LoopOnce, 1);
action.clampWhenFinished = true;
action.play();
mixer.setTime(0.5);
gltf.scene.updateMatrixWorld(true);
const v = new THREE.Vector3();
const min = new THREE.Vector3(Infinity, Infinity, Infinity);
const max = min.clone().negate();
for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
  v.fromBufferAttribute(mesh.geometry.attributes.position, i);
  mesh.applyBoneTransform(i, v);
  v.applyMatrix4(mesh.matrixWorld);
  min.min(v);
  max.max(v);
}
console.log("bounds Idle@0.5s:", min.toArray().map((n) => +n.toFixed(3)), "→", max.toArray().map((n) => +n.toFixed(3)));

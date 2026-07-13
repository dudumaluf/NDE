#!/usr/bin/env node
/**
 * vat-bake — gera texturas VAT (Vertex Animation Texture) a partir de arquivos
 * GLB/GLTF com skinned mesh + animações (fluxo típico: Mixamo → GLB), no
 * formato que o app LIMIAR consome: .bin float16 raw + vat.json (doc 03 §3).
 * Elimina a dependência do Houdini para personagens/clipes novos.
 *
 * Este arquivo é só o CLI; o motor mora em tools/vat-core.mjs (compartilhado
 * com a interface visual, tools/vat-studio.mjs — `npm run studio`).
 *
 * Uso:
 *   node tools/vat-bake.mjs char.{glb|fbx} [anims ...] --out public/vat/<nome> \
 *     [--fps 18] [--frames 60] [--clip Nome:loop|oneshot ...] [--skip Nome ...] \
 *     [--height 0.7] [--max-verts N] [--topology auto|soup|indexed] \
 *     [--in-place] [--selftest]
 *
 * FBX binário do Mixamo entra direto (sem Blender): escala cm→m, ossos
 * "mixamorig:" e o clipe "mixamo.com" (vira o nome do arquivo) são
 * normalizados em tools/fbx-normalize.mjs. FBX ASCII/6.x: converter antes.
 *
 * - O personagem/esqueleto vem do PRIMEIRO arquivo; os seguintes podem conter
 *   só animações (mesmo esqueleto — padrão Mixamo, um arquivo por clipe).
 * - Clipes são empilhados verticalmente na textura NA ORDEM em que aparecem
 *   (ordem dos argumentos; dentro de um arquivo, ordem do arquivo).
 * - Os dados nascem Y-up do three → basis "identity" no descriptor (nada do
 *   x_negz_y do Houdini), pés no y=0, centro XZ na origem.
 *
 * Ver tools/README.md para o fluxo completo (exportar do Mixamo, limites).
 */

import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import {
  BakeError,
  MAX_TEXTURE_WIDTH,
  bakeToDir,
  collectClips,
  runSelftest,
} from "./vat-core.mjs";

function fail(msg) {
  console.error(`vat-bake: ${msg}`);
  process.exit(1);
}

function printHelp() {
  console.log(`vat-bake — GLB/GLTF/FBX (skinned + animações) → texturas VAT (.bin f16 + vat.json)

uso: node tools/vat-bake.mjs <char.glb|fbx> [anims ...] --out <dir> [opções]

FBX: binário 7.x (padrão do Mixamo atual) entra direto — escala em cm,
ossos "mixamorig:" e clipe "mixamo.com" são normalizados. ASCII/6.x não
(converta para GLB — tools/README.md).

opções:
  --out <dir>          diretório de saída (ex.: public/vat/soldier) [obrigatório]
  --frames <n>         frames por clipe (default 60, igual ao asset atual)
  --fps <n>            fps de playback no descriptor (default 18 — paridade)
  --clip <Nome:modo>   modo de playback do clipe: loop | oneshot (default loop)
  --skip <Nome>        não assar este clipe (ex.: --skip TPose)
  --y-offset <Nome:v>  offset Y manual do clipe (unidades da fonte; o
                       aterramento por clipe é automático — isto soma em cima)
  --height <h>         normaliza a altura (frame 0 do 1º clipe) para h unidades
                       (default 0.7 = convenção do asset atual; 0 = manter metros)
  --max-verts <n>      decima a malha até ≤ n vértices únicos (meshoptimizer)
                       antes do bake — para malhas Mixamo grandes/multidão
  --topology <t>       soup | indexed | auto (default auto: soup se couber em
                       ${MAX_TEXTURE_WIDTH} colunas, senão indexed)
  --in-place           remove translação XZ do osso raiz (anda no lugar)
  --selftest           valida o resultado assado (dimensões, NaN, loops, ranges)
  -h, --help           esta ajuda

exemplo:
  node tools/vat-bake.mjs tools/fixtures/Soldier.glb --out public/vat/soldier \\
    --skip TPose --selftest
  → app: http://localhost:5199/?vat=soldier&scene=personagem

interface visual (recomendada): npm run studio → http://localhost:5198`);
}

function parseArgs(argv) {
  const args = {
    inputs: [],
    out: null,
    fps: 18,
    frames: 60,
    clipModes: new Map(), // nome minúsculo → "loop" | "oneshot"
    skip: new Set(),
    yOffsets: new Map(), // nome minúsculo → offset Y manual (unid. da fonte)
    height: 0.7,
    maxVerts: 0,
    topology: "auto",
    inPlace: false,
    selftest: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) fail(`falta valor para ${a}`);
      return argv[i];
    };
    switch (a) {
      case "--out":
        args.out = next();
        break;
      case "--fps":
        args.fps = Number(next());
        break;
      case "--frames":
        args.frames = Math.round(Number(next()));
        break;
      case "--clip": {
        const raw = next();
        const ci = raw.lastIndexOf(":");
        const name = ci >= 0 ? raw.slice(0, ci) : "";
        const mode = ci >= 0 ? raw.slice(ci + 1) : "";
        if (!name || (mode !== "loop" && mode !== "oneshot"))
          fail(`--clip espera Nome:loop ou Nome:oneshot (recebi "${raw}")`);
        args.clipModes.set(name.toLowerCase(), mode);
        break;
      }
      case "--skip":
        args.skip.add(next().toLowerCase());
        break;
      case "--y-offset": {
        const raw = next();
        const ci = raw.lastIndexOf(":");
        const name = ci >= 0 ? raw.slice(0, ci) : "";
        const val = Number(ci >= 0 ? raw.slice(ci + 1) : NaN);
        if (!name || !Number.isFinite(val))
          fail(`--y-offset espera Nome:valor em unidades da fonte (recebi "${raw}")`);
        args.yOffsets.set(name.toLowerCase(), val);
        break;
      }
      case "--height":
        args.height = Number(next());
        break;
      case "--max-verts":
        args.maxVerts = Math.round(Number(next()));
        break;
      case "--topology": {
        const t = next();
        if (!["soup", "indexed", "auto"].includes(t)) fail(`--topology inválida: ${t}`);
        args.topology = t;
        break;
      }
      case "--in-place":
        args.inPlace = true;
        break;
      case "--selftest":
        args.selftest = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        if (a.startsWith("--")) fail(`flag desconhecida: ${a} (use --help)`);
        args.inputs.push(a);
    }
  }
  if (!args.out) fail("--out é obrigatório");
  if (!Number.isFinite(args.fps) || args.fps <= 0) fail("--fps inválido");
  if (!Number.isInteger(args.frames) || args.frames < 2) fail("--frames deve ser ≥ 2");
  if (!Number.isFinite(args.height) || args.height < 0) fail("--height inválido");
  if (!Number.isInteger(args.maxVerts) || args.maxVerts < 0) fail("--max-verts inválido");
  return args;
}

const fmtBytes = (n) =>
  n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`;
const fmtV3 = (v) => `[${v.map((n) => (+n).toFixed(4)).join(", ")}]`;

function printSelftest(outDir) {
  const { checks, problems } = runSelftest(outDir);
  for (const c of checks) console.log(c.ok ? `  ok  ${c.label}` : `  FALHOU  ${c.label}`);
  return problems;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // --selftest sem inputs: só valida um diretório já assado
  if (args.inputs.length === 0) {
    if (!args.selftest) fail("nenhum arquivo de entrada (use --help)");
    if (!existsSync(join(args.out, "vat.json"))) fail(`sem vat.json em ${args.out}`);
    console.log(`selftest ${args.out}:`);
    const problems = printSelftest(args.out);
    process.exit(problems.length ? 1 : 0);
  }

  const t0 = Date.now();
  const name = basename(args.out);
  console.log(`vat-bake — "${name}"`);

  let result;
  try {
    result = await bakeToDir(
      {
        inputs: args.inputs,
        out: args.out,
        frames: args.frames,
        fps: args.fps,
        height: args.height,
        topology: args.topology,
        maxVerts: args.maxVerts,
      },
      {
        selectEntries: (files, model) => collectClips(files, model, args),
        warn: (msg) => console.warn(`  aviso: ${msg}`),
        info: (ev) => {
          if (ev.type === "decimate")
            console.log(
              `  decimação: ${ev.from} → ${ev.to} vértices únicos (${ev.fromTriangles} → ${ev.triangles} tris, erro ${ev.error})`,
            );
          if (ev.type === "plan") {
            console.log(
              `  malha: ${ev.meshes} skinned mesh(es) · ${ev.uniqueVerts} vértices únicos · ` +
                `${ev.triangles} triângulos → topologia ${ev.topology} (${ev.width} colunas)`,
            );
            console.log(`  meshHash: ${ev.meshHash} (VATs com o mesmo hash podem cruzar morph no app)`);
            console.log(`  clipes (${ev.entries.length} × ${args.frames} frames @ ${args.fps} fps):`);
            ev.entries.forEach((e, i) =>
              console.log(
                `    ${i} ${e.name} (${e.mode}${e.inPlace ? ", no lugar" : ""})  fonte ${e.duration.toFixed(3)}s · ${e.source}`,
              ),
            );
          }
          if (ev.type === "rootmotion")
            console.log(`  root motion exportado: "${ev.clip}" desloca ${ev.travel} un. (descriptor.rootMotion)`);
          if (ev.type === "normalize") {
            console.log(
              `  normalização: translate ${fmtV3(ev.translate)} · escala ${ev.scale.toFixed(4)}` +
                ` (altura fonte ${ev.sourceHeight.toFixed(3)} → ${(ev.sourceHeight * ev.scale).toFixed(3)})`,
            );
            for (const g of ev.grounds ?? [])
              if (Math.abs(g.groundOffset) > 5e-4 || g.yOffset)
                console.log(
                  `    chão de "${g.clip}": ${g.groundOffset >= 0 ? "+" : ""}${g.groundOffset.toFixed(4)}` +
                    (g.yOffset ? ` + manual ${g.yOffset.toFixed(4)}` : ""),
                );
          }
        },
      },
    );
  } catch (e) {
    if (e instanceof BakeError) fail(e.message);
    throw e;
  }

  console.log(
    `  out: ${args.out} (positions ${fmtBytes(result.bytes.positions)}, normals ${fmtBytes(result.bytes.normals)}` +
      (result.topology === "indexed" ? `, indices ${fmtBytes(result.bytes.indices)}` : "") +
      `, vat.json) em ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
  console.log(`  app: http://localhost:5199/?vat=${encodeURIComponent(name)}&scene=personagem`);

  if (args.selftest) {
    console.log("selftest:");
    const problems = printSelftest(args.out);
    if (problems.length) {
      console.error(`selftest FALHOU (${problems.length} problema(s))`);
      process.exit(1);
    }
    console.log("selftest passou.");
  }
}

await main();

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  Fn,
  If,
  Loop,
  exp,
  float,
  hash,
  instanceIndex,
  instancedArray,
  int,
  ivec2,
  length,
  min,
  mix,
  mx_noise_float,
  normalize,
  select,
  smoothstep,
  textureLoad,
  uniform,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import { vat } from "../vat/runtime";
import { detectClipRoles, type ClipRoles } from "../vat/clipRoles";
import {
  heightTSL,
  terrainU,
  wrapDeltaTSL,
  wrapPosTSL,
} from "../scene/heightfield";
import { mouseTarget } from "./mouseTarget";

type N = any;

/**
 * Simulação da multidão em compute (TSL).
 *
 * Estado por agente em storage buffers: posição, velocidade, direção
 * (suavizada), fase do passo e ESTADO DE ANIMAÇÃO (doc 04 §5.5). Forças por
 * frame:
 *   wander     — curl noise 2D (campo sem divergência, evolui no tempo),
 *                com pausas orgânicas por grupo (dormentes/testemunhas;
 *                desligam com seek ativo) e multiplicadores por grupo
 *   separação  — cada agente empurra os vizinhos: ninguém atravessa ninguém
 *                (O(N²) por enquanto; hash grid espacial é o upgrade p/ 16k+.
 *                 No fallback WebGL2 a separação desliga: transform feedback
 *                 não dá acesso aleatório aos buffers — doc 03 §10)
 *   contenção  — banda suave no raio do Campo (o "distance check" do patch)
 *   mouse      — atrai/repele em torno do alvo raycastado no chão
 *   seek       — M3: agentes com alvo (pessoa real com posição UMAP ou lente)
 *                buscam targets[i].xyz com arrival (desacelera chegando) e
 *                damping tangencial (não orbita). targets[i].w = tem-alvo;
 *                uSeekWeight (a "gravidade") liga/desliga globalmente.
 *   onda       — na gravidade, quem está LONGE do alvo ganha teto de
 *                velocidade maior (chega "correndo", assenta por último) —
 *                formação rápida E legível (doc 04 §5.5).
 *   campo      — 2026-07-14: repulsão radial da pessoa ATIVA (seguida no
 *                clique) por uniforms (fieldPos/Radius/Strength/Agent) —
 *                zero buffer novo, idêntico nos 2 backends. Migrantes
 *                (com alvo) ganham peso assimétrico na separação
 *                (yieldWeight — só WebGPU, onde a separação existe).
 *   story field— 2026-07-14b: campo dos COM-HISTÓRIA sobre os dormentes,
 *                polaridade attract/repel (ajuntamentos ao redor das
 *                testemunhas OU halo de legibilidade). Vive no loop de
 *                separação (lê agentMeta[j].x do vizinho) — só WebGPU.
 *   inércia    — 2026-07-14b (fix do stutter do follow): a separação e a
 *                contenção RECEBIDAS pelo agente selecionado são escaladas
 *                por selInertia (0 = imune, atravessa como um trem; 1 =
 *                igual a todos). No WebGL2 (sem separação) só a contenção.
 *   esteira    — 2026-07-14b (o comportamento PADRÃO do follow, correção do
 *                Dudu): pessoa seguida PINADA (teto de velocidade →0 +
 *                walking forçado no state pass, fase a stageSpeed) e o
 *                MUNDO se move: TODOS os outros agentes recuam a
 *                stageSpeed contra o heading (deslocamento direto de
 *                posição — a física deles continua normal por cima); o
 *                chão scrolla junto (heightfield scroll) e os ALVOS vivem
 *                no ground frame (o seek subtrai o scroll — formações
 *                ancoradas no mundo são carregadas e wrappam como todos).
 *                O steering do mouse (CrowdMesh) gira o heading da esteira.
 *   wrap       — 2026-07-14b (mundo-toro, doc 03 §14.8): com wrapLen > 0
 *                (uniform compartilhado com o heightfield) a contenção
 *                radial DESLIGA e as posições wrappam por módulo na área
 *                canônica [−L/2, L/2)² — os 2 backends (aritmética local).
 *                Deltas de seek/mouse/campo usam o caminho toroidal;
 *                separação toroidal opcional (wrapToroidalSep) quando o wrap
 *                está ligado; histerese na costura (wrapHysteresis).
 *
 * Máquina de estados POR AGENTE (pass próprio, buildStatePass): lê a
 * velocidade REAL e a distância ao alvo e escreve `states` (vec4: clipA,
 * clipB, blend, stateId+stateTime empacotados em w). Transições parado ⇄
 * andando ⇄ correndo com histerese; chegada assenta em idle OU rezar
 * (sorteio estável por agente, peso vem do agentMeta). O crossfade A/B que
 * o shader já fazia globalmente passa a ler estes valores por instância.
 *
 * Orçamento de varyings do transform feedback (WebGL2, teto de 4 por pass —
 * cada storage lido/escrito vira attribute+varying no GLSLNodeBuilder):
 *   update:    positions + velocities + headings           = 3 (sobra 1)
 *   state:     states + phases + positions + velocities    = 4 (cheio)
 *   reset:     positions + velocities + headings + phases  = 4 (cheio)
 *   resetStates: states                                    = 1
 * A fase do passo migrou do update para o state pass por isso. Alvos e meta
 * entram nos passes TF por DataTexture + textureLoad (padrão dos targets do
 * M3): Float32Array espelhado em storage (WebGPU) e textura (WebGL2).
 */
export class CrowdSim {
  readonly maxCount: number;

  readonly positions: N;
  readonly velocities: N;
  readonly headings: N;
  readonly phases: N;
  /** vec4 por agente: xyz = alvo no mundo, w = tem-alvo (0/1). CPU escreve. */
  readonly targets: N;
  /** Espelho CPU de `targets` — escrever aqui e chamar commitTargets(). */
  readonly targetsArray: Float32Array;
  /** O mesmo array como DataTexture — caminho do compute no fallback WebGL2. */
  private targetsTexture: THREE.DataTexture;
  /**
   * vec4 por agente: x = com-história (1) / dormente (0), y = probabilidade
   * de REZAR ao assentar (peso extra de `transformacao` já embutido na CPU),
   * z/w reservados (Maré/M4: valência e beat). CPU escreve (commitAgentMeta).
   */
  readonly agentMeta: N;
  readonly agentMetaArray: Float32Array;
  private agentMetaTexture: THREE.DataTexture;
  /**
   * Estado de animação por agente (vec4): x = clipA, y = clipB (índices
   * GLOBAIS de clipe), z = blend A→B [0,1], w = stateId + stateTime/1000
   * (0 parado · 1 andando · 2 correndo · 3 assentado-idle · 4 rezando).
   * Escrito no state pass; o render lê via storage PBO (não é atributo —
   * o limite de 8 vertex buffers do WebGPU fica intacto).
   */
  readonly states: N;
  /** Papéis de clipe detectados do descriptor ativo (idle/walk/run/rezar). */
  readonly clipRoles: ClipRoles;

  private texSide: number;

  readonly u = {
    count: uniform(1024),
    dt: uniform(0.016),
    time: uniform(0),
    seed: uniform(3),
    gridN: uniform(32),
    spawnArea: uniform(42),
    /** Raio do disco de spawn (= contenção); agentes fora são puxados à borda. */
    spawnRadius: uniform(21),
    spawnNoise: uniform(0.6),
    containRadius: uniform(21),
    containBand: uniform(5),
    /** Wrap: separação usa menor caminho no toro (1) ou euclidiana (0). */
    wrapToroidalSep: uniform(1),
    /** Metros além de L/2 antes do teleporte (histerese anti-flicker). */
    wrapHysteresis: uniform(0.8),
    maxSpeed: uniform(0.8),
    accel: uniform(4),
    drag: uniform(0.8),
    /** Curl por grupo (2026-07-15): meta.x escolhe testemunha vs dormente. */
    witWanderWeight: uniform(1),
    witWanderScale: uniform(0.12),
    witWanderEvolve: uniform(0.12),
    witSpeedMul: uniform(1),
    /** Espalhamento de curl por testemunha (0 = uniforme; 1 = ±100%). */
    witWanderVariance: uniform(0.15),
    /** Espalhamento de teto de velocidade por testemunha. */
    witSpeedVariance: uniform(0.2),
    /** Pausas orgânicas do wander das testemunhas (0 = ninguém para). */
    witPauseAmount: uniform(0.2),
    wanderWhileSeek: uniform(0.35),
    lockAtCluster: uniform(1),
    dormWanderWeight: uniform(0.8),
    dormWanderScale: uniform(0.12),
    dormWanderEvolve: uniform(0.12),
    /** Espalhamento de força do curl por dormente (0 = uniforme; 1 = ±100%). */
    dormWanderVariance: uniform(0.25),
    /** Espalhamento de teto de velocidade por dormente. */
    dormSpeedVariance: uniform(0.25),
    wanderWhileForm: uniform(0.35),
    lockAtForm: uniform(1),
    sepWeight: uniform(1.6),
    sepRadius: uniform(0.7),
    mousePos: uniform(new THREE.Vector3()),
    mouseMode: uniform(0), // -1 repele, 0 off, +1 atrai
    mouseRadius: uniform(7),
    mouseWeight: uniform(1.2),
    /** Gravidade dos dados (M3): 0 = solto (wander puro), >0 = busca o alvo. */
    seekWeight: uniform(0),
    /** Raio de chegada: dentro dele o alvo deixa de puxar (arrival). */
    seekArrive: uniform(1.6),
    /** Damping extra perto do alvo (mata órbita e overshoot). */
    seekDamp: uniform(1.2),
    turnRate: uniform(6),
    /** Frames de walk cycle por unidade percorrida (acopla passo à velocidade). */
    phasePerUnit: uniform(34),

    // --- estados por agente (doc 04 §5.5) ---
    /** 1 = máquina de estados por agente; 0 = modo global antigo (botões).
     *  Nasce em 0 (o CrowdMesh liga via leva): sim sem o wiring novo se
     *  comporta exatamente como antes — compat entre commits paralelos. */
    perAgentOn: uniform(0),
    /** Limiar parado⇄andando (|v| em unidades/s). */
    v0: uniform(0.12),
    /** Limiar andando⇄correndo. */
    v1: uniform(1.15),
    /** Histerese fracional dos limiares (±12% default). */
    hyst: uniform(0.12),
    /** Duração do crossfade entre estados (s). */
    stateFade: uniform(0.3),
    /** Tempo mínimo num estado antes de trocar (anti-flicker). */
    dwell: uniform(0.35),
    /** Playback extra do passo no estado correndo (walk como corrida). */
    runBoost: uniform(1.35),
    /** Playback × dos estados parado (0) e assentado/rezando (3/4) —
     *  grupo Vocabulary (doc 06). 1 = velocidade natural do clipe. */
    idlePlayback: uniform(1),
    settlePlayback: uniform(1),
    /** Papéis de clipe (índices globais — ver clipRoles.ts/Vocabulary).
     *  O gesto de ASSENTAR não tem uniform: vem por agente no meta.y. */
    clipIdle: uniform(0),
    clipIdle2: uniform(0),
    clipWalk: uniform(0),
    clipRun: uniform(0),
    /** Onda de chegada: ganho do teto de velocidade por distância ao alvo.
     *  Default 0 (neutro) — o valor de design (0.9) entra pelo leva. */
    waveGain: uniform(0),
    waveNear: uniform(5),
    waveFar: uniform(20),
    /** Dormentes: multiplicador do teto de velocidade (testemunhas: witSpeedMul). */
    dormantSpeedMul: uniform(0.7),
    /** Pausas orgânicas do wander dos dormentes (design 0.45 no leva). */
    dormPauseAmount: uniform(0.45),

    // --- campo do ativo + palco (2026-07-14, doc 04) ---
    /** Campo de repulsão da pessoa SEGUIDA: os outros desviam em vez de
     *  atravessar/apinhar. Por UNIFORM (zero buffer novo — igual nos 2
     *  backends); o CrowdMesh alimenta fieldPos por frame do espelho. */
    fieldOn: uniform(0),
    fieldPos: uniform(new THREE.Vector3()),
    fieldRadius: uniform(2.5),
    fieldStrength: uniform(1.2),
    /** Índice da pessoa seguida (excluída do próprio campo); −1 = ninguém. */
    fieldAgent: uniform(-1),
    /** Separação ASSIMÉTRICA (só no caminho WebGPU — o fallback não tem
     *  separação desde o M2): vizinho COM alvo (migrando) empurra × mais
     *  forte quem NÃO tem alvo — abre caminho. 1 = simétrico (neutro). */
    yieldWeight: uniform(1),
    /** Agente SELECIONADO (seguido) — alvo da inércia; −1 = ninguém.
     *  Separado do fieldAgent: a inércia vale mesmo com o campo desligado. */
    selAgent: uniform(-1),
    /** Inércia do selecionado (fix do stutter, 2026-07-14b): escala a
     *  separação E a contenção RECEBIDAS por ele. 0 = imune (trem);
     *  1 = igual a todos. Separação só existe no WebGPU. */
    selInertia: uniform(0.15),
    /** Campo dos com-história sobre os DORMENTES (modo livre): −1 repele
     *  (halo externo), 0 off, +1 social (atrai fora + repulsão na bolha). */
    storyMode: uniform(0),
    /** Alcance externo da coroa (modo social). */
    storyRadius: uniform(2),
    /** Bolha interna de repulsão (modo social). */
    storyRepelRadius: uniform(0.55),
    /** Halo de repulsão (modo repel puro). */
    storyRepelHaloRadius: uniform(2),
    storyAttractStrength: uniform(0.8),
    storyRepelStrength: uniform(1),
    /** Steering DIRETO do seguido (modo legado, treadmill OFF): força de
     *  seek na direção do leme + teto de velocidade próprio (stageSpeed).
     *  No modo padrão (pino+esteira) o leme age via stageHeading. */
    /** Agente sob o cursor (hover freeze, Witnesses): −1 = ninguém. */
    hoverFreezeAgent: uniform(-1),
    /** 1 = testemunha hovered para no mundo (facilita clique). */
    hoverFreezeOn: uniform(0),
    steerOn: uniform(0),
    steerDir: uniform(new THREE.Vector2(0, 0)),
    steerStrength: uniform(1),
    /** Esteira do follow (padrão desde 2026-07-14b; kill-switch no leva):
     *  pino da pessoa seguida + o MUNDO inteiro recua a stageSpeed. */
    stageOn: uniform(0),
    stageAgent: uniform(-1),
    /** Direção do "andar" da viagem (unit, XZ) — CPU normaliza/suaviza. */
    stageHeading: uniform(new THREE.Vector2(0, 1)),
    /** Velocidade ATUAL da esteira (CPU suaviza; 0 no deadzone do leme). */
    stageSpeed: uniform(0.9),
    /** Teto configurado da esteira (leva) — limiares walk/run do pino. */
    stageSpeedMax: uniform(0.9),
    /** Escala 0..1 do leme analógico (distância mouse → velocidade). */
    steerSpeedMul: uniform(1),
    /** Stride do pino (frames/unidade) — independente do stride global. */
    stagePhasePerUnit: uniform(48),
    /** Playback × da animação do seguido na esteira (só o pino). */
    stagePlayback: uniform(1),
    /** Playback × extra no pino quando estado = walk. */
    stageWalkPlayback: uniform(1),
    /** Playback × extra no pino quando estado = run. */
    stageRunPlayback: uniform(1.85),
  };

  private resetPass: N;
  private resetStatesPass: N;
  private updateFull: N; // com separação (WebGPU)
  private updateNoSep: N; // sem separação (fallback WebGL2/TF)
  private stateFull: N; // alvos/meta via storage (WebGPU)
  private stateNoSep: N; // alvos/meta via DataTexture (WebGL2/TF)

  constructor(maxCount: number) {
    this.maxCount = maxCount;
    this.positions = instancedArray(maxCount, "vec3");
    this.velocities = instancedArray(maxCount, "vec3");
    this.headings = instancedArray(maxCount, "vec2");
    this.phases = instancedArray(maxCount, "float");
    this.targets = instancedArray(maxCount, "vec4");
    this.targetsArray = this.targets.value.array as Float32Array;
    this.states = instancedArray(maxCount, "vec4");
    this.agentMeta = instancedArray(maxCount, "vec4");
    this.agentMetaArray = this.agentMeta.value.array as Float32Array;
    // Default seguro: todo mundo "com-história" (multiplicadores neutros) e
    // gesto de assentar = idle próprio (y = −1) — sem computeAgentMeta o
    // comportamento é idêntico ao pré-M3.6.
    for (let i = 0; i < maxCount; i++) {
      this.agentMetaArray[i * 4] = 1;
      this.agentMetaArray[i * 4 + 1] = -1;
    }

    this.texSide = Math.ceil(Math.sqrt(maxCount));
    this.targetsTexture = this.makeMirrorTexture(this.targetsArray);
    this.agentMetaTexture = this.makeMirrorTexture(this.agentMetaArray);

    this.clipRoles = detectClipRoles();
    this.u.clipIdle.value = this.clipRoles.idle;
    this.u.clipIdle2.value = this.clipRoles.idle2;
    this.u.clipWalk.value = this.clipRoles.walk;
    this.u.clipRun.value = this.clipRoles.run;
    // Com clipe de corrida REAL (VAT futura do Studio), o walk não precisa
    // de playback extra — o clipe já corre.
    if (this.clipRoles.hasRunClip) this.u.runBoost.value = 1;

    this.resetPass = this.buildResetPass();
    this.resetStatesPass = this.buildResetStatesPass();
    this.updateFull = this.buildUpdatePass(true);
    this.updateNoSep = this.buildUpdatePass(false);
    this.stateFull = this.buildStatePass(true);
    this.stateNoSep = this.buildStatePass(false);
  }

  private makeMirrorTexture(array: Float32Array): THREE.DataTexture {
    const tex = new THREE.DataTexture(
      array,
      this.texSide,
      this.texSide,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  /** Sobe o espelho CPU dos alvos para a GPU (após computeTargets). */
  commitTargets(): void {
    (this.targets.value as THREE.BufferAttribute).needsUpdate = true;
    this.targetsTexture.needsUpdate = true;
  }

  /** Sobe o espelho CPU do meta por agente (após computeAgentMeta). */
  commitAgentMeta(): void {
    (this.agentMeta.value as THREE.BufferAttribute).needsUpdate = true;
    this.agentMetaTexture.needsUpdate = true;
  }

  /** Variação de idle estável por agente (~35% usam o idle 2).
   *  CUIDADO: hash() do TSL trunca o seed com toUint() — seeds precisam ser
   *  INTEIROS DISTINTOS por agente (fi + offset), nunca fi×fração. */
  private idleVariant(fi: N): N {
    return select(
      hash(fi.add(11 * 4096)).lessThan(0.35),
      this.u.clipIdle2,
      this.u.clipIdle,
    );
  }

  private buildResetPass(): N {
    const u = this.u;
    return Fn(() => {
      // Índice permutado para a POSIÇÃO de spawn (i×197 mod count, 197 primo
      // → bijeção p/ count=N²): as pessoas reais (slots 0..45, M3) nascem
      // espalhadas pela multidão em vez de enfileiradas no canto do grid.
      const count: N = u.gridN.mul(u.gridN);
      const i: N = float(instanceIndex).mul(197).mod(count);
      const n: N = u.gridN;
      const ix: N = i.mod(n);
      const iz: N = i.div(n).floor();
      const denom: N = n.sub(1).max(1);
      const spacing: N = u.spawnArea.div(n);

      const rnd = (k: number): N =>
        hash(i.add(u.seed.mul(7919)).add(float(k * 37.77)));

      const gx: N = ix.div(denom).sub(0.5).mul(u.spawnArea);
      const gz: N = iz.div(denom).sub(0.5).mul(u.spawnArea);
      const px: N = gx.add(rnd(1).mul(2).sub(1).mul(u.spawnNoise).mul(spacing));
      const pz: N = gz.add(rnd(2).mul(2).sub(1).mul(u.spawnNoise).mul(spacing));
      const pos2: N = vec2(px, pz);
      const len: N = length(pos2).add(1e-5);
      const scale: N = select(
        len.greaterThan(u.spawnRadius),
        u.spawnRadius.div(len),
        float(1),
      );
      const pxC: N = px.mul(scale);
      const pzC: N = pz.mul(scale);

      // Terreno vivo (M4f): nascer JÁ na superfície (h=0 com terreno off).
      this.positions
        .element(instanceIndex)
        .assign(vec3(pxC, heightTSL(pxC, pzC), pzC));
      this.velocities.element(instanceIndex).assign(vec3(0, 0, 0));

      const ang: N = rnd(3).mul(Math.PI * 2);
      this.headings.element(instanceIndex).assign(vec2(ang.sin(), ang.cos()));
      this.phases.element(instanceIndex).assign(rnd(4).mul(vat().framesPerClip));
    })().compute(this.maxCount);
  }

  /** Estados nascem em "parado" com a variação de idle do agente (pass
   *  próprio: escrever `states` no reset principal estouraria os 4 varyings
   *  do transform feedback no WebGL2). */
  private buildResetStatesPass(): N {
    return Fn(() => {
      const fi: N = float(instanceIndex);
      const idleClip: N = this.idleVariant(fi);
      this.states
        .element(instanceIndex)
        .assign(vec4(idleClip, idleClip, 0, 0));
    })().compute(this.maxCount);
  }

  private buildUpdatePass(withSeparation: boolean): N {
    const u = this.u;
    return Fn(() => {
      const selfI: N = int(instanceIndex);
      const fi: N = float(instanceIndex);
      const p: N = this.positions.element(instanceIndex).toVar();
      const v: N = this.velocities.element(instanceIndex).toVar();

      // --- seek (M3), parte 1: onde estou em relação ao meu alvo? ---
      // targets.w=1 marca agente com pessoa/alvo; uSeekWeight é a gravidade
      // global. `arrive` desacelera chegando; `nearT` alimenta o damping e a
      // atenuação do wander (perto do alvo o noise não re-arranca o agente).
      // No pass sem separação (fallback WebGL2/TF) alvo e meta vêm de
      // texturas: um 4º/5º storage read estouraria os varyings do TF.
      const side = int(this.texSide);
      const texUv: N = ivec2(selfI.mod(side), selfI.div(side));
      const tgt: N = withSeparation
        ? this.targets.element(instanceIndex)
        : textureLoad(this.targetsTexture, texUv);
      const meta: N = withSeparation
        ? this.agentMeta.element(instanceIndex)
        : textureLoad(this.agentMetaTexture, texUv);

      // --- esteira do follow (padrão, 2026-07-14b) + mundo-toro ---
      // Pessoa seguida é o PINO: velocidade→0 e heading girando ao heading
      // da viagem — a animação de andar é forçada no state pass; o MUNDO
      // anda: todos os outros recuam a stageSpeed (deslocamento direto na
      // integração, mais abaixo) e o chão scrolla junto (CrowdMesh).
      const stageDir: N = u.stageHeading;
      const isPinned: N = u.stageOn.mul(
        select(fi.equal(u.stageAgent), float(1), float(0)),
      );
      const isSel: N = select(fi.equal(u.selAgent), float(1), float(0));
      // Wrap universal: período L compartilhado com o heightfield (0 = off;
      // wrapDeltaTSL degenera em identidade — dá para aplicar sempre).
      const L: N = terrainU.wrapLen;
      const wrapOn: N = select(L.greaterThan(0.5), float(1), float(0));
      const wrap2 = (d: N): N =>
        vec2(wrapDeltaTSL(d.x, L), wrapDeltaTSL(d.y, L));
      // Ground frame → view frame: alvos são ancorados no MUNDO; a esteira
      // desloca o mundo −scroll, então o alvo aparece em tgt − scroll (e
      // wrappa). Formações inteiras são carregadas e loopam como todos.
      const scroll: N = vec2(terrainU.scrollX, terrainU.scrollZ);

      const seekGate: N = tgt.w.mul(smoothstep(0.0, 0.05, u.seekWeight));
      // Delta TOROIDAL do seek: um agente que wrappa perto da borda busca o
      // alvo pelo menor caminho no toro — nunca atravessa o mapa de volta.
      const toTgt: N = wrap2(tgt.xz.sub(scroll).sub(p.xz));
      const tDist: N = length(toTgt).add(1e-5);
      const arrive: N = smoothstep(float(0), u.seekArrive, tDist);
      const nearT: N = float(1).sub(arrive).mul(seekGate);

      // --- wander: curl por grupo (dois campos, mix por meta.x — vec3+mix quebra o TS) ---
      const potD = (xz: N): N =>
        mx_noise_float(
          vec3(
            xz.x.mul(u.dormWanderScale),
            xz.y.mul(u.dormWanderScale),
            u.time.mul(u.dormWanderEvolve),
          ),
        );
      const potW = (xz: N): N =>
        mx_noise_float(
          vec3(
            xz.x.mul(u.witWanderScale),
            xz.y.mul(u.witWanderScale),
            u.time.mul(u.witWanderEvolve),
          ),
        );
      const pot = (xz: N): N => mix(potD(xz), potW(xz), meta.x);
      const e = float(0.35);
      const dPdx: N = pot(p.xz.add(vec2(e, 0))).sub(pot(p.xz.sub(vec2(e, 0))));
      const dPdz: N = pot(p.xz.add(vec2(0, e))).sub(pot(p.xz.sub(vec2(0, e))));
      const wander: N = normalize(vec2(dPdz, dPdx.negate()).add(vec2(1e-5, 0)));

      // Pausas orgânicas: cada agente vive um ciclo lento próprio (sawtooth
      // de hash + tempo); enquanto o ciclo está abaixo do pauseAmt do grupo o
      // wander desliga e o drag o assenta — a máquina de estados LÊ o
      // resultado (idle) em vez de encená-lo. A fração parada é exatamente
      // o slider (ciclo uniforme em [0,1)); episódios de ~10–25 s.
      const pauseRate: N = mix(
        float(0.015),
        float(0.05),
        hash(fi.add(2 * 4096)),
      );
      const pauseCycle: N = hash(fi.add(3 * 4096))
        .add(u.time.mul(pauseRate))
        .fract();
      const pauseAmt: N = mix(u.dormPauseAmount, u.witPauseAmount, meta.x);
      const pauseGate: N = smoothstep(
        pauseAmt.sub(0.03),
        pauseAmt.add(0.03),
        pauseCycle,
      );
      // Pausas por grupo (2026-07-15b): cada agente no seu ciclo; seek ativo
      // (migração/formação) desliga — ninguém para no caminho ao alvo.
      const pauseEff: N = mix(pauseGate, float(1), seekGate);

      // Grupos: com-história (meta.x=1) usa os pesos base; dormentes (0)
      // ganham multiplicadores próprios — mais lentos/contemplativos.
      // Steering direto (modo legado): o leme sobrepõe o wander DELE.
      const steerGate: N = u.steerOn
        .mul(isSel)
        .mul(float(1).sub(isPinned))
        .toVar();
      const wanderAtten: N = float(1).sub(nearT.mul(0.85));
      const wWeight: N = mix(u.dormWanderWeight, u.witWanderWeight, meta.x);
      // Variância de curl por agente (por grupo): complementa pausas.
      const wanderVar: N = mix(u.dormWanderVariance, u.witWanderVariance, meta.x);
      const wanderJit: N = float(1).add(
        wanderVar.mul(hash(fi.add(7 * 4096)).mul(2).sub(1)),
      );
      const wWeightEff: N = wWeight.mul(wanderJit);
      const nearLock: N = nearT.greaterThan(0.85);
      const lockFlag: N = mix(u.lockAtForm, u.lockAtCluster, meta.x);
      const lockFactor: N = float(1).sub(lockFlag.mul(nearLock).mul(seekGate));
      const whileSl: N = mix(u.wanderWhileForm, u.wanderWhileSeek, meta.x);
      const whileFactor: N = mix(
        float(1),
        whileSl,
        seekGate.mul(float(1).sub(nearLock)),
      );
      const wanderMul: N = wWeightEff
        .mul(wanderAtten)
        .mul(pauseEff)
        .mul(float(1).sub(steerGate))
        .mul(lockFactor)
        .mul(whileFactor);
      const acc: N = wander.mul(wanderMul).toVar();

      // --- separação: vizinhos empurram (evitação de sobreposição) ---
      if (withSeparation) {
        // Peso ASSIMÉTRICO (campo dos ativos, doc 04): vizinho COM alvo
        // (migrando ao núcleo) empurra até yieldWeight× mais forte quem NÃO
        // tem alvo — os dormentes abrem caminho. Só age com a gravidade
        // ativa (senão ninguém está migrando); yieldWeight=1 é neutro.
        // Custa uma leitura extra de targets[j] no loop O(N²) — medido.
        // toVar() OBRIGATÓRIO: sem ele o TSL inlina a expressão (que lê
        // targets[self]) em CADA iteração do loop — 40→23 fps medido.
        const seekG: N = smoothstep(0.0, 0.05, u.seekWeight);
        const yieldGain: N = u.yieldWeight
          .sub(1)
          .mul(float(1).sub(tgt.w))
          .mul(seekG)
          .toVar();
        // Story field (2026-07-14b): vizinho COM história atrai/repele os
        // DORMENTES no raio próprio. O gate do self sai do loop (toVar —
        // lição do yieldGain); a leitura de agentMeta[j] só acontece no
        // branch (dormentes, modo ligado, dist < raio). Só WebGPU.
        const storyGate: N = u.storyMode
          .abs()
          .mul(float(1).sub(meta.x))
          .toVar();
        const sep: N = vec2(0, 0).toVar();
        const storyPull: N = vec2(0, 0).toVar();
        const storyPush: N = vec2(0, 0).toVar();
        Loop({ start: int(0), end: int(u.count), type: "int" }, ({ i: j }: any) => {
          If(j.notEqual(selfI), () => {
            const q: N = this.positions.element(j);
            const dEuc: N = p.xz.sub(q.xz);
            const dTor: N = vec2(
              wrapDeltaTSL(dEuc.x, L),
              wrapDeltaTSL(dEuc.y, L),
            );
            const torG: N = u.wrapToroidalSep.mul(wrapOn);
            const d: N = vec2(
              mix(dEuc.x, dTor.x, torG),
              mix(dEuc.y, dTor.y, torG),
            );
            const dist: N = length(d).add(1e-5);
            If(dist.lessThan(u.sepRadius), () => {
              const push: N = d
                .div(dist)
                .mul(u.sepRadius.sub(dist).div(u.sepRadius).pow(2));
              const boost: N = float(1).add(
                yieldGain.mul(this.targets.element(j).w),
              );
              sep.addAssign(push.mul(boost));
            });
            const storyOuter: N = select(
              u.storyMode.greaterThan(float(0.5)),
              u.storyRadius,
              select(
                u.storyMode.lessThan(float(-0.5)),
                u.storyRepelHaloRadius,
                float(0),
              ),
            );
            If(storyGate.greaterThan(0.5).and(dist.lessThan(storyOuter)), () => {
              const wit: N = this.agentMeta.element(j).x;
              // Social (+1): repulsão interna + atração na coroa externa.
              If(u.storyMode.greaterThan(0.5), () => {
                If(dist.lessThan(u.storyRepelRadius), () => {
                  const repelFall: N = float(1).sub(
                    smoothstep(
                      u.storyRepelRadius.mul(0.85),
                      u.storyRepelRadius,
                      dist,
                    ),
                  );
                  storyPush.addAssign(d.div(dist).mul(repelFall).mul(wit));
                });
                If(dist.greaterThanEqual(u.storyRepelRadius), () => {
                  const attractFall: N = smoothstep(
                    u.storyRadius,
                    u.storyRepelRadius,
                    dist,
                  );
                  storyPull.addAssign(
                    d.div(dist).negate().mul(attractFall).mul(wit),
                  );
                });
              });
              // Repel puro (−1): halo de legibilidade.
              If(u.storyMode.lessThan(float(-0.5)), () => {
                const fall: N = smoothstep(
                  u.storyRepelHaloRadius,
                  u.storyRepelHaloRadius.mul(0.25),
                  dist,
                );
                storyPush.addAssign(d.div(dist).mul(fall).mul(wit));
              });
            });
          });
        });
        const sepLen: N = length(sep).add(1e-5);
        const sepCapped: N = sep.div(sepLen).mul(min(sepLen, float(2.5)));
        // Inércia do selecionado (fix do stutter): ele recebe a separação
        // escalada — os inativos cedem, ele quase não desvia.
        acc.addAssign(
          sepCapped.mul(u.sepWeight).mul(mix(float(1), u.selInertia, isSel)),
        );
        // Story field: forças separadas (attract / repel). Social usa as duas.
        const pullLen: N = length(storyPull).add(1e-5);
        const pushLen: N = length(storyPush).add(1e-5);
        acc.addAssign(
          storyPull
            .div(pullLen)
            .mul(min(pullLen, float(3)))
            .mul(u.storyAttractStrength),
        );
        acc.addAssign(
          storyPush
            .div(pushLen)
            .mul(min(pushLen, float(3)))
            .mul(u.storyRepelStrength),
        );
      }

      // --- contenção: banda suave no limiar do Campo ---
      // Com o wrap universal ligado a contenção DESLIGA (o toro é a regra
      // do mundo); sem wrap, o selecionado recebe a contenção pela mesma
      // inércia da separação (senão a borda o rebate — metade do vaivém).
      const centerDist: N = length(p.xz).add(1e-5);
      const inward: N = p.xz.div(centerDist).negate();
      const contain: N = smoothstep(
        u.containRadius.sub(u.containBand),
        u.containRadius,
        centerDist,
      );
      acc.addAssign(
        inward
          .mul(contain)
          .mul(3)
          .mul(float(1).sub(wrapOn))
          .mul(mix(float(1), u.selInertia, isSel)),
      );

      // --- mouse: atrai/repele dentro do raio (delta toroidal no wrap) ---
      const toMouse: N = wrap2(u.mousePos.xz.sub(p.xz));
      const mDist: N = length(toMouse).add(1e-5);
      const mFall: N = smoothstep(u.mouseRadius, u.mouseRadius.mul(0.15), mDist);
      acc.addAssign(
        toMouse.div(mDist).mul(mFall).mul(u.mouseMode).mul(u.mouseWeight),
      );

      // --- campo do ativo (doc 04): a pessoa seguida abre espaço ---
      // Força radial suave (forte no corpo, zero no raio) empurrando só XZ.
      // Por uniform: mesmo custo/comportamento nos DOIS backends. O próprio
      // agente do campo é excluído (fieldAgent); quem TEM alvo também desvia
      // (campo é presença física, não hierarquia). Delta toroidal: o campo
      // atravessa a costura do wrap junto com a pessoa.
      const fromField: N = wrap2(p.xz.sub(u.fieldPos.xz));
      const fDist: N = length(fromField).add(1e-5);
      const fFall: N = smoothstep(u.fieldRadius, u.fieldRadius.mul(0.2), fDist);
      const fGate: N = u.fieldOn.mul(
        select(fi.equal(u.fieldAgent), float(0), float(1)),
      );
      acc.addAssign(
        fromField.div(fDist).mul(fFall).mul(u.fieldStrength).mul(fGate),
      );

      // --- seek (M3), parte 2: a força em si (arrival zera no alvo) ---
      // Steering direto (legado) sobrepõe a gravidade DELE.
      acc.addAssign(
        toTgt
          .div(tDist)
          .mul(arrive)
          .mul(u.seekWeight)
          .mul(seekGate)
          .mul(float(1).sub(steerGate)),
      );

      // --- steering direto (modo legado, treadmill OFF): o leme empurra ---
      acc.addAssign(u.steerDir.mul(u.steerStrength).mul(2).mul(steerGate));

      // Hover freeze (Witnesses): para a vida própria (wander/seek) — NÃO
      // isenta da esteira: no follow, quem congela fica em pé no tapete que
      // anda (como dormente parado), sem deslizar contra a câmera.
      const hoverFreeze: N = u.hoverFreezeOn.mul(
        select(fi.equal(u.hoverFreezeAgent), float(1), float(0)),
      );
      acc.mulAssign(float(1).sub(hoverFreeze));

      // --- integração com drag e teto de velocidade ---
      // O damping do arrival soma ao drag base: quem chegou perde inércia.
      // Onda de chegada (doc 04 §5.5): com gravidade ativa, quem está LONGE
      // do alvo ganha teto maior — chega "correndo" e assenta por último.
      // Dormentes andam mais devagar (dormantSpeedMul) e não recebem wave.
      const dt: N = u.dt;
      const dragTotal: N = u.drag.add(nearT.mul(u.seekDamp));
      const vel2: N = v.xz
        .add(acc.mul(u.accel).mul(dt))
        .mul(exp(dragTotal.negate().mul(dt)))
        .toVar();
      const speed: N = length(vel2).add(1e-6);
      // Onda de chegada (doc 04 §5.5): só testemunhas (meta.x=1) com seek ativo.
      const wave: N = float(1).add(
        u.waveGain
          .mul(seekGate)
          .mul(meta.x)
          .mul(smoothstep(u.waveNear, u.waveFar, tDist)),
      );
      // Pino da esteira: teto de velocidade →0 na pessoa seguida (a animação
      // de andar é forçada no state pass; o mundo é que se move). Steering
      // direto (legado): teto próprio = stageSpeed (a velocidade da viagem).
      const speedVar: N = mix(u.dormSpeedVariance, u.witSpeedVariance, meta.x);
      const speedJit: N = float(1).add(
        speedVar.mul(hash(fi.add(11 * 4096)).mul(2).sub(1)),
      );
      const speedCap: N = u.maxSpeed
        .mul(mix(u.dormantSpeedMul, u.witSpeedMul, meta.x))
        .mul(speedJit)
        .mul(wave)
        .mul(
          mix(
            float(1),
            u.stageSpeed
              .div(u.maxSpeed.max(1e-4))
              .mul(u.steerSpeedMul),
            steerGate,
          ),
        )
        .mul(float(1).sub(isPinned.mul(0.999)));
      vel2.assign(vel2.mul(min(float(1), speedCap.div(speed))));
      vel2.assign(vel2.mul(float(1).sub(hoverFreeze)));

      // Forças/velocidades vivem em XZ; o y é DERIVADO da superfície
      // (heightfield compartilhado com o chão — M4f). Fios e render herdam.
      const newPos: N = p.xz.add(vel2.mul(dt)).toVar();
      newPos.assign(mix(newPos, p.xz, hoverFreeze));
      // Esteira UNIVERSAL do follow: TODOS menos o pino recuam a stageSpeed
      // CONTRA o heading da viagem, por deslocamento DIRETO de posição (não
      // velocidade — a máquina de estados vê cada um pela física própria:
      // quem está parado no mundo desliza em pé, quem anda, anda por cima).
      // Hover freeze entra nessa fila — parado no tapete, não parado no ar.
      newPos.subAssign(
        stageDir.mul(
          u.stageSpeed
            .mul(dt)
            .mul(u.stageOn)
            .mul(float(1).sub(isPinned)),
        ),
      );
      // Wrap universal (mundo-toro): posição por módulo na área canônica
      // [−L/2, L/2)² — quem sai por uma borda reaparece na oposta com
      // velocidade/estado/fase intactos (é só aritmética de posição).
      // Histerese na costura: só teleporta após L/2 + wrapHysteresis.
      newPos.assign(wrapPosTSL(newPos, L, u.wrapHysteresis.mul(wrapOn)));
      this.positions
        .element(instanceIndex)
        .assign(vec3(newPos.x, heightTSL(newPos.x, newPos.y), newPos.y));
      this.velocities.element(instanceIndex).assign(vec3(vel2.x, 0, vel2.y));

      // --- direção suavizada (só gira quando há movimento real) ---
      // Pino do palco: gira ao heading do palco mesmo com velocidade ~0
      // (a pessoa "anda" para onde a viagem aponta).
      const h: N = this.headings.element(instanceIndex).toVar();
      const spd: N = length(vel2);
      const turnK: N = float(1).sub(exp(u.turnRate.negate().mul(dt)));
      const targetDir: N = mix(vel2.div(spd.add(1e-5)), stageDir, isPinned);
      const blended: N = normalize(mix(h, targetDir, turnK).add(vec2(1e-6, 0)));
      const gate: N = mix(smoothstep(0.02, 0.08, spd), float(1), isPinned);
      this.headings
        .element(instanceIndex)
        .assign(normalize(mix(h, blended, gate).add(vec2(1e-6, 0))));

      // (a fase do passo migrou para o state pass — orçamento de varyings)
    })().compute(this.maxCount);
  }

  /**
   * Máquina de estados por agente (doc 04 §5.5) + integração da fase.
   * Transições dirigidas pela velocidade REAL com histerese (limiar de
   * ENTRAR > limiar de FICAR) e dwell mínimo — nunca pisca. Chegada
   * (gravidade ativa, perto do alvo, parado) assenta em idle ou rezar por
   * sorteio estável (seed = índice do agente, peso do agentMeta). O
   * crossfade avança aqui (blend += dt/fade) e promove B→A ao completar —
   * mesma mecânica do VatClipPlayer, agora por agente na GPU.
   */
  private buildStatePass(withStorage: boolean): N {
    const u = this.u;
    return Fn(() => {
      const selfI: N = int(instanceIndex);
      const fi: N = float(instanceIndex);
      const side = int(this.texSide);
      const texUv: N = ivec2(selfI.mod(side), selfI.div(side));

      const p: N = this.positions.element(instanceIndex).toVar();
      const v: N = this.velocities.element(instanceIndex).toVar();
      const s4: N = this.states.element(instanceIndex).toVar();

      const tgt: N = withStorage
        ? this.targets.element(instanceIndex)
        : textureLoad(this.targetsTexture, texUv);
      const meta: N = withStorage
        ? this.agentMeta.element(instanceIndex)
        : textureLoad(this.agentMetaTexture, texUv);

      const speed: N = length(v.xz);
      const clipA: N = s4.x.toVar();
      const clipB: N = s4.y.toVar();
      const blend: N = s4.z.toVar();
      // w empacota stateId + stateTime/1000 (tempo saturado em 900 s —
      // float32 dá resolução < 1 ms nessa faixa, sobra para o dwell).
      const stateId: N = s4.w.floor().toVar();
      const stateTime: N = s4.w.fract().mul(1000).add(u.dt).min(900).toVar();

      // --- crossfade em andamento avança e promove B→A ao completar ---
      If(clipA.notEqual(clipB).or(blend.greaterThan(0)), () => {
        blend.assign(blend.add(u.dt.div(u.stateFade.max(1e-4))).min(1));
        If(blend.greaterThanEqual(1), () => {
          clipA.assign(clipB);
          blend.assign(0);
        });
      });

      // --- contexto do alvo (assentamento) ---
      // MESMO caminho do update: alvo no ground frame (subtrai o scroll da
      // esteira) e delta toroidal — um assentado carregado pela esteira
      // continua "perto do alvo" e não desassenta ao wrappar.
      const Ls: N = terrainU.wrapLen;
      const tDist: N = length(
        vec2(
          wrapDeltaTSL(tgt.x.sub(terrainU.scrollX).sub(p.x), Ls),
          wrapDeltaTSL(tgt.z.sub(terrainU.scrollZ).sub(p.z), Ls),
        ),
      );
      const seekOn: N = tgt.w.mul(smoothstep(0.0, 0.05, u.seekWeight));
      const settleR: N = u.seekArrive.mul(1.5);

      // --- locomoção com histerese: entrar exige mais que ficar ---
      const hUp: N = float(1).add(u.hyst);
      const hDn: N = float(1).sub(u.hyst);
      const walkThr: N = select(
        stateId.greaterThanEqual(1),
        u.v0.mul(hDn),
        u.v0.mul(hUp),
      );
      const runThr: N = select(
        stateId.equal(2),
        u.v1.mul(hDn),
        u.v1.mul(hUp),
      );
      const loco: N = select(
        speed.greaterThan(runThr),
        float(2),
        select(speed.greaterThan(walkThr), float(1), float(0)),
      );

      // --- assentar: chamado (gravidade/lente), chegou e parou ---
      const settled: N = stateId.greaterThanEqual(3);
      const enterSettle: N = seekOn
        .greaterThan(0.5)
        .and(tDist.lessThan(settleR))
        .and(speed.lessThan(u.v0.mul(hUp)));
      const exitSettle: N = seekOn
        .lessThan(0.5)
        .or(tDist.greaterThan(settleR.mul(1.6)))
        .or(speed.greaterThan(u.v0.mul(3)));

      // Gesto de assentamento decidido na CPU (agentMapping/Vocabulary):
      // meta.y = −1 → idle próprio do agente (estado 3); ≥0 → índice GLOBAL
      // do clipe-gesto (estado 4: rezar ou regra elemento→clipe). O sorteio
      // ponderado saiu do shader — regras novas nunca mais tocam a GPU.
      const gesture: N = meta.y;
      const isGesture: N = gesture.greaterThanEqual(0);
      const settleState: N = select(isGesture, float(4), float(3));
      const idleClip: N = this.idleVariant(fi);
      const settleClip: N = select(isGesture, gesture, idleClip);

      const desired: N = loco.toVar();
      If(settled.and(exitSettle.not()).or(enterSettle), () => {
        desired.assign(settleState);
      });

      // Pino da esteira: velocidade real ~0 mas a ilusão exige locomoção.
      // stageSpeed mapeia walk→run (frações do teto stageSpeedMax); no
      // deadzone (stageSpeed→0) a máquina volta a idle honesto.
      const isPinned: N = u.stageOn.mul(
        select(fi.equal(u.stageAgent), float(1), float(0)),
      );
      If(isPinned.greaterThan(0.5).and(u.stageSpeed.greaterThan(0.05)), () => {
        const runPin: N = u.stageSpeed.greaterThan(u.stageSpeedMax.mul(0.55));
        desired.assign(select(runPin, float(2), float(1)));
      });

      // --- transição (respeitando o dwell anti-flicker) ---
      const desiredClip: N = select(
        desired.equal(0),
        idleClip,
        select(
          desired.equal(1),
          u.clipWalk,
          select(desired.equal(2), u.clipRun, settleClip),
        ),
      );
      If(desired.notEqual(stateId).and(stateTime.greaterThan(u.dwell)), () => {
        // mesma promoção do player: interromper um fade >50% promove o B
        If(blend.greaterThan(0.5), () => {
          clipA.assign(clipB);
        });
        clipB.assign(desiredClip);
        blend.assign(0);
        stateId.assign(desired);
        stateTime.assign(0);
      });

      // --- fase do passo integra a velocidade real (migrada do update) ---
      // Correndo, o playback ganha boost extra (walk como corrida enquanto
      // não há clipe run na VAT — clipRoles.hasRunClip zera o boost).
      const runBoost: N = mix(
        float(1),
        u.runBoost,
        select(stateId.equal(2), float(1), float(0)).mul(u.perAgentOn),
      );
      // Playback × por estado (Vocabulary): o clock global anda a fps
      // frames/s; somar (mult−1)×fps na FASE faz o frame efetivo andar a
      // mult×fps — sem buffer novo, sem tocar o sampler.
      const stateMult: N = select(
        stateId.greaterThanEqual(3),
        u.settlePlayback,
        select(stateId.equal(0), u.idlePlayback, float(1)),
      )
        .sub(1)
        .mul(u.perAgentOn);
      // Pino do palco: velocidade real ~0; fase avança com stageSpeed × stride
      // do seguido (uniforms próprios — não usa o passo global da multidão).
      const pinWalkMul: N = select(stateId.equal(1), u.stageWalkPlayback, float(1));
      const pinRunMul: N = select(stateId.equal(2), u.stageRunPlayback, float(1));
      const pinPhase: N = u.stagePhasePerUnit
        .mul(u.stagePlayback)
        .mul(pinWalkMul)
        .mul(pinRunMul);
      const ph: N = this.phases.element(instanceIndex);
      this.phases
        .element(instanceIndex)
        .assign(
          ph
            .add(speed.mul(u.dt).mul(u.phasePerUnit).mul(runBoost))
            .add(u.stageSpeed.mul(u.dt).mul(pinPhase).mul(isPinned))
            .add(u.dt.mul(float(vat().fps)).mul(stateMult))
            .mod(vat().framesPerClip),
        );

      this.states
        .element(instanceIndex)
        .assign(vec4(clipA, clipB, blend, stateId.add(stateTime.div(1000))));
    })().compute(this.maxCount);
  }

  reset(renderer: THREE.WebGPURenderer): void {
    renderer.compute(this.resetPass);
    renderer.compute(this.resetStatesPass);
  }

  /** Avança um passo. `withSeparation=false` no fallback WebGL2. */
  update(
    renderer: THREE.WebGPURenderer,
    dt: number,
    withSeparation: boolean,
  ): void {
    this.u.dt.value = Math.min(dt, 1 / 20);
    this.u.time.value += this.u.dt.value;
    this.u.mousePos.value.copy(mouseTarget.point);
    this.u.mouseMode.value =
      mouseTarget.mode === "atrair" ? 1 : mouseTarget.mode === "repelir" ? -1 : 0;
    renderer.compute(withSeparation ? this.updateFull : this.updateNoSep);
    // O state pass roda sempre (custo ~0): os estados ficam quentes mesmo
    // com o toggle master desligado — religar é seamless.
    renderer.compute(withSeparation ? this.stateFull : this.stateNoSep);
  }
}

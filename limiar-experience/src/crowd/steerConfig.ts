/** Deadzone do leme (m): mouse dentro deste raio da pessoa → velocidade 0. */
export const STEER_DEADZONE = 1.5;

/** Raio externo da rampa de velocidade (deadzone + ramp). */
export function steerOuterRadius(rampM: number): number {
  return STEER_DEADZONE + Math.max(0.01, rampM);
}

/** 0..1: distância do mouse além da deadzone → velocidade da viagem. */
export function steerSpeedFactor(
  steerLen: number,
  rampM: number,
  steerOn: boolean,
  mouseMoved: boolean,
): number {
  if (!steerOn || !mouseMoved) return 1;
  if (steerLen <= STEER_DEADZONE) return 0;
  const span = Math.max(0.01, rampM);
  const t = Math.min(1, (steerLen - STEER_DEADZONE) / span);
  return t * t * (3 - 2 * t);
}

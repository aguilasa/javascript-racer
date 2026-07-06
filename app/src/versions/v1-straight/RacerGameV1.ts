import { RacerGame } from '../../core/RacerGame'

export class RacerGameV1 extends RacerGame {
  // v1 is a straight, flat road with no curves, hills, parallax, or extras.
  // The base implementation of RacerGame already provides:
  // - buildRoad(): 500 straight/flat segments via addRoad(500, 0, 0, 0, 0)
  // - updateLateralForces(): lateral movement with dx = dt * 2 * (speed/maxSpeed)
  // - updateParallax(): no-op (correct for v1)
  // - updateExtras(): no-op (correct for v1)
  // - getCameraY(): returns cameraHeight (correct for v1)
  // - renderExtraLayer(): no-op (correct for v1)
  // - getPlayerScreenY(): returns height (correct for v1)
  // - getPlayerUpdown(): returns 0 (correct for v1)
  // No overrides needed.
}

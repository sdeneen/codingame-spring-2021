import DirectionDistanceTracker from "../model/DirectionDistanceTracker";

/**
 * Data related to cells that doesn't change throughout the course of the game
 */
export default class StaticCellData {
  directionDistanceTracker: DirectionDistanceTracker;

  constructor(sameDirectionDistanceTracker) {
    this.directionDistanceTracker = sameDirectionDistanceTracker;
  }
}

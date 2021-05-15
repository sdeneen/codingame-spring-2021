import DirectionDistanceTracker from "../model/DirectionDistanceTracker";

/**
 * Data related to cells that doesn't change throughout the course of the game
 */
export default class StaticCellData {
  sameDirectionDistanceTracker: DirectionDistanceTracker;

  constructor(sameDirectionDistanceTracker) {
    this.sameDirectionDistanceTracker = sameDirectionDistanceTracker;
  }
}

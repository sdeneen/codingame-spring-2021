import Player from "./model/Player";
import { getAllTreesThatAreBlockedByAnyShadow } from "./shadowObserver";
import Tree from "./model/Tree";
import Cell from "./model/Cell";
import DirectionDistanceTracker from "./model/DirectionDistanceTracker";

/**
 * Given the game state, calculate how many sun points the given player earns in the sun collection phase at the start
 * of the day.
 */
const calculateSunPointsGainedForDay = (
  sameDirectionDistanceTracker: DirectionDistanceTracker,
  cells: Cell[],
  player: Player,
  allTrees: Tree[],
  day: number
) => {
  const blockedCells = getAllTreesThatAreBlockedByAnyShadow(
    sameDirectionDistanceTracker,
    cells,
    allTrees,
    day
  );
  const blockedTreeIndices = new Set(blockedCells.map((t) => t.cellIndex));
  const sunPointArray = player
    .getTrees()
    .filter((t) => !blockedTreeIndices.has(t.cellIndex))
    .map((t) => t.getSunPointGainPerDay());

  return sunPointArray.length > 0
    ? sunPointArray.reduce((sunPoints1, sunPoints2) => sunPoints1 + sunPoints2)
    : 0;
};

export default calculateSunPointsGainedForDay;

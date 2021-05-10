import Player from "./model/Player";
import { getAllTreesThatAreBlockedByAnyShadow } from "./shadowObserver";
import Tree from "./model/Tree";
import Cell from "./model/Cell";

/**
 * Given the game state, calculate how many sun points the given player earns in a turn.
 */
const calculateSunPointsGainedForTurn = (cells: Cell[], player: Player, allTrees: Tree[], day: number) => {
    const blockedCells = getAllTreesThatAreBlockedByAnyShadow(cells, allTrees, day);
    const blockedTreeIndices = new Set(blockedCells.map(t => t.cellIndex));
    const sunPointArray = player.trees
        .filter(t => !blockedTreeIndices.has(t.cellIndex))
        .map(t => t.getSunPointGainPerTurn())

    return sunPointArray.length > 0
        ? sunPointArray.reduce((sunPoints1, sunPoints2) => sunPoints1 + sunPoints2)
        : 0;
};

export default calculateSunPointsGainedForTurn;
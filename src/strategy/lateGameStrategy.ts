import { COST_TO_COMPLETE_TREE } from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Game from "../model/Game";
import {
  estimateWhichTreesWeCanCompleteByEndOfGame,
  getActionToGetCloserToCompletingSpookedTrees,
  getCompletableTrees,
} from "./completeTreesStrategy";
import { getGrowActionWithBestSunPointPayoff } from "./sunPointSaverStrategy";
import { NUM_DAYS } from "../miscConstants";
import Tree from "../model/Tree";
import Player from "../model/Player";
import Cell from "../model/Cell";

const getBestTreeToComplete = (
  allCells: Cell[],
  player: Player
): Tree | null => {
  if (player.sunPoints >= COST_TO_COMPLETE_TREE) {
    const completableTrees = getCompletableTrees(player.getTrees());
    const treeToComplete = completableTrees.reduce((tree1, tree2) => {
      if (tree1 === null) {
        return tree2;
      }
      if (tree2 === null) {
        return tree1;
      }

      const richness1 = allCells[tree1.cellIndex].richness;
      const richness2 = allCells[tree2.cellIndex].richness;
      return richness1 >= richness2 ? tree1 : tree2;
    }, null);
    return treeToComplete || null;
  }

  return null;
};

/**
 * Strategy that runs during the late game.
 * Sets us up for a bunch of growing up until the last turn when we try to COMPLETE
 * everything (if we have the sun points!!!)
 */
const getActionForLateGameStrategy = (game: Game): Action | null => {
  const numTurnsRemainingExcludingCurTurn = NUM_DAYS - game.day - 1;
  const { myPlayer, cells } = game;
  const actionToGetCloserToCompletingSpookedTree =
    getActionToGetCloserToCompletingSpookedTrees(
      game,
      Math.min(numTurnsRemainingExcludingCurTurn, 2)
    );
  if (actionToGetCloserToCompletingSpookedTree !== null) {
    return actionToGetCloserToCompletingSpookedTree;
  }

  const treesToGrow = estimateWhichTreesWeCanCompleteByEndOfGame(game);
  const growAction = getGrowActionWithBestSunPointPayoff(game, treesToGrow);
  if (growAction !== null) {
    return growAction;
  }

  const isLastDay = game.day === NUM_DAYS - 1;
  if (isLastDay) {
    const treeToComplete = getBestTreeToComplete(cells, myPlayer);
    if (treeToComplete !== null) {
      return new Action("COMPLETE", null, treeToComplete.cellIndex);
    }
  }

  return new Action("WAIT");
};

export default getActionForLateGameStrategy;

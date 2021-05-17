import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree, { SEED_TREE_SIZE, SMALL_TREE_SIZE } from "../model/Tree";
import determineGameStateAfterGrowAction from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import { getBestSeedAction } from "./seedingStrategy";
import {
  getCompleteActionForTreeThatBlocksOurOtherTrees,
  getGrowOrCompleteActionForSpookedTrees,
} from "./completeTreesStrategy";
import { HIGH_RICHNESS } from "../model/Cell";
import StaticCellData from "../model/StaticCellData";

const getActionForSunPointSaverStrategy = (
  game: Game,
  staticCellData: StaticCellData
): Action => {
  // Looks to see if any of our size 3 trees will block our other trees and tries to complete them
  // TODO improvement: if we're able to GROW the other tree out of the blockage instead, then don't bother COMPLETEing and let the grow action part of the algo handle it
  const completeActionToUnblock =
    getCompleteActionForTreeThatBlocksOurOtherTrees(game);
  if (completeActionToUnblock !== null) {
    console.error("===== Completing a tree to unblock our other tree(s)");
    return completeActionToUnblock;
  }

  const bestGrowOrCompleteAction = getGrowOrCompleteActionForSpookedTrees(game);
  if (bestGrowOrCompleteAction !== null) {
    console.error("===== Trying to grow/complete spooked trees early!");
    return bestGrowOrCompleteAction;
  }
  const freeSeedAction = getBestSeedAction(staticCellData, game);
  const bestGrowAction = getGrowActionWithBestSunPointPayoff(
    game,
    staticCellData
  );

  if (
    freeSeedAction !== null &&
    bestGrowAction !== null &&
    freeSeedAction?.sourceCellIdx === bestGrowAction?.sourceCellIdx
  ) {
    if (game.cells[freeSeedAction.targetCellIdx].richness === HIGH_RICHNESS) {
      return freeSeedAction;
    }
    return bestGrowAction;
  }

  if (freeSeedAction !== null) {
    return freeSeedAction;
  }
  if (bestGrowAction !== null) {
    return bestGrowAction;
  }

  return new Action("WAIT");
};

const getGrowActionWithBestSunPointPayoff = (
  game: Game,
  staticCellData: StaticCellData
): Action | null => {
  const { cells, myPlayer } = game;
  const myTrees = myPlayer.getTrees();
  const tooManySmallTrees: boolean =
    myTrees.filter((tree) => tree.size === SMALL_TREE_SIZE).length >= 1;
  const { sunPoints: mySunPoints } = myPlayer;
  let bestTree: Tree = null;
  let bestTreeRichness: number = -1;
  let bestResultingSunPointsDifferential: number = -1000000;

  myTrees.forEach((tree) => {
    const cellForTree = cells[tree.cellIndex];
    if (tooManySmallTrees && tree.size === SEED_TREE_SIZE) {
      return;
    }
    const nextAction = tree.getNextAction();
    if (nextAction?.type === "GROW") {
      const growthCost = calculateTreeActionCost(
        myTrees,
        nextAction.type,
        tree
      );
      if (growthCost <= mySunPoints) {
        const newGameState = determineGameStateAfterGrowAction(
          game,
          nextAction.targetCellIdx
        );
        const ourSunPointsAfterCollection =
          newGameState.myPlayer.sunPoints +
          calculateSunPointsGainedForDay(
            staticCellData.directionDistanceTracker,
            newGameState.cells,
            newGameState.myPlayer,
            newGameState.getAllTrees(),
            newGameState.day + 1
          );

        const opponentSunPointsAfterCollection =
          newGameState.opponentPlayer.sunPoints +
          calculateSunPointsGainedForDay(
            staticCellData.directionDistanceTracker,
            newGameState.cells,
            newGameState.opponentPlayer,
            newGameState.getAllTrees(),
            newGameState.day + 1
          );

        const sunPointDifferential =
          ourSunPointsAfterCollection - opponentSunPointsAfterCollection;
        if (
          bestResultingSunPointsDifferential < sunPointDifferential ||
          (bestResultingSunPointsDifferential < sunPointDifferential &&
            cellForTree.richness > bestTreeRichness)
        ) {
          bestResultingSunPointsDifferential = sunPointDifferential;
          bestTreeRichness = cellForTree.richness;
          bestTree = tree;
        }
      }
    }
  });

  return bestTree?.getNextAction() || null;
};

export default getActionForSunPointSaverStrategy;

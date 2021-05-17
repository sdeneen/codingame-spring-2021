import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree, {
  SMALL_TREE_SIZE,
  MEDIUM_TREE_SIZE,
  LARGE_TREE_SIZE,
  LARGEST_TREE_SIZE,
} from "../model/Tree";
import determineGameStateAfterGrowAction from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import { getBestSeedAction } from "./seedingStrategy";
import {
  getGrowOrCompleteActionForSpookedTrees,
  getActionForCompleteTreesStrategy,
  getCompleteActionForTreeThatBlocksOurOtherTrees,
} from "./completeTreesStrategy";
import { HIGH_RICHNESS } from "../model/Cell";
import StaticCellData from "../model/StaticCellData";

// EARLY_GAME_SIZE_TO_MAX_ALLOWED = {
//   [SMALL_TREE_SIZE]: 1,
//   [MEDIUM_TREE_SIZE]: 2,
//   [LARGE_TREE_SIZE]: 4,
// };

const TREE_SIZE_TO_MAX_ALLOWED = {
  [SMALL_TREE_SIZE]: 1,
  [MEDIUM_TREE_SIZE]: 2,
  [LARGE_TREE_SIZE]: 4,
};

const getActionForSunPointSaverStrategy = (
  game: Game,
  staticCellData: StaticCellData
): Action => {
  const { myPlayer, day } = game;
  const myTrees = myPlayer.getTrees();
  const allowCompletes = day >= 11;
  // Looks to see if any of our size 3 trees will block our other trees and tries to complete them
  // TODO improvement: if we're able to GROW the other tree out of the blockage instead, then don't bother COMPLETEing and let the grow action part of the algo handle it
  const completeActionToUnblock = allowCompletes
    ? getCompleteActionForTreeThatBlocksOurOtherTrees(game)
    : null;
  if (completeActionToUnblock !== null) {
    console.error("===== Completing a tree to unblock our other tree(s)");
    return completeActionToUnblock;
  }
  const bestGrowOrCompleteAction = allowCompletes
    ? getGrowOrCompleteActionForSpookedTrees(game)
    : null;
  if (bestGrowOrCompleteAction !== null) {
    console.error("===== Trying to grow/complete spooked trees early!");
    return bestGrowOrCompleteAction;
  }
  const freeSeedAction = getBestSeedAction(staticCellData, game);
  const isGrowAllowedPerSizeToGrowTo = {};

  Object.keys(TREE_SIZE_TO_MAX_ALLOWED).forEach((size) => {
    const maxAllowedTreesOfSize = TREE_SIZE_TO_MAX_ALLOWED[size];
    isGrowAllowedPerSizeToGrowTo[size] =
      !allowCompletes ||
      myTrees.filter((tree) => tree.size === parseInt(size, 10)).length <
        maxAllowedTreesOfSize;
  });

  const bestGrowAction = getGrowActionWithBestSunPointPayoff(
    game,
    staticCellData,
    isGrowAllowedPerSizeToGrowTo
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

  // If we can't grow because we've hit our tree limit, try to complete to open up more tree growing
  if (
    allowCompletes &&
    Object.values(isGrowAllowedPerSizeToGrowTo).every((allowed) => !allowed)
  ) {
    const completeAction = getActionForCompleteTreesStrategy(game);
    if (completeAction !== null) {
      return completeAction;
    }
  }

  // // If we can't grow to large because we've hit our tree limit, try to complete to open up more tree growing
  // if (!isGrowAllowedPerSizeToGrowTo[LARGEST_TREE_SIZE]) {
  //   const completeAction = getActionForCompleteTreesStrategy(game);
  //   if (completeAction !== null) {
  //     return completeAction;
  //   }
  // }

  return new Action("WAIT");
};

const getGrowActionWithBestSunPointPayoff = (
  game: Game,
  staticCellData: StaticCellData,
  isGrowAllowedPerSizeToGrowTo: Record<number, boolean>
): Action | null => {
  const { cells, myPlayer, day } = game;
  const myTrees = myPlayer.getTrees();

  const { sunPoints: mySunPoints } = myPlayer;
  let bestTree: Tree = null;
  let bestTreeRichness: number = -1;
  let bestResultingSunPointsDifferential: number = -1000000;

  myTrees.forEach((tree) => {
    const cellForTree = cells[tree.cellIndex];
    // Can't grow largest trees any more
    if (tree.size === LARGEST_TREE_SIZE) {
      return;
    }

    if (!isGrowAllowedPerSizeToGrowTo[tree.size + 1]) {
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
          (bestResultingSunPointsDifferential === sunPointDifferential &&
            bestTreeRichness < cellForTree.richness)
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

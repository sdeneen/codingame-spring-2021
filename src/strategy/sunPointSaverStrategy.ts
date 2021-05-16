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
} from "./completeTreesStrategy";
import { HIGH_RICHNESS } from "../model/Cell";
import StaticCellData from "../model/StaticCellData";

const TREE_SIZE_TO_MAX_ALLOWED = {
  [SMALL_TREE_SIZE]: 2,
  [MEDIUM_TREE_SIZE]: 3,
  [LARGE_TREE_SIZE]: 3,
};

const getActionForSunPointSaverStrategy = (
  game: Game,
  staticCellData: StaticCellData
): Action => {
  const { myPlayer } = game;
  const myTrees = myPlayer.getTrees();
  const bestGrowOrCompleteAction = getGrowOrCompleteActionForSpookedTrees(game);
  if (bestGrowOrCompleteAction !== null) {
    console.error("===== Trying to grow/complete spooked trees early!");
    return bestGrowOrCompleteAction;
  }
  const freeSeedAction = getBestSeedAction(staticCellData, game);
  const isGrowAllowedPerSizeToGrowTo = {};

  Object.keys(TREE_SIZE_TO_MAX_ALLOWED).forEach((size) => {
    const maxAllowedTreesOfSize = TREE_SIZE_TO_MAX_ALLOWED[size];
    isGrowAllowedPerSizeToGrowTo[size] =
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
  let mostResultingSunPoints: number = -1;

  const sunPointsAfterCollectionNextTurnIfWeDidNotGrow =
    myPlayer.sunPoints +
    calculateSunPointsGainedForDay(
      staticCellData.directionDistanceTracker,
      cells,
      myPlayer,
      game.getAllTrees(),
      day + 1
    );

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
        const sunPointsAfterCollection =
          newGameState.myPlayer.sunPoints +
          calculateSunPointsGainedForDay(
            staticCellData.directionDistanceTracker,
            newGameState.cells,
            newGameState.myPlayer,
            newGameState.getAllTrees(),
            newGameState.day + 1
          );

        // Excluding late-game, if this grow doesn't help us gain sun points at all next turn, don't allow it
        if (
          day < 12 &&
          sunPointsAfterCollection <=
            sunPointsAfterCollectionNextTurnIfWeDidNotGrow - growthCost
        ) {
          return;
        }

        if (
          mostResultingSunPoints < sunPointsAfterCollection ||
          (mostResultingSunPoints === sunPointsAfterCollection &&
            bestTreeRichness < cellForTree.richness)
        ) {
          mostResultingSunPoints = sunPointsAfterCollection;
          bestTreeRichness = cellForTree.richness;
          bestTree = tree;
        }
      }
    }
  });

  return bestTree?.getNextAction() || null;
};

export default getActionForSunPointSaverStrategy;

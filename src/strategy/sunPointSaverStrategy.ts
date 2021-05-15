import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree, {
  LARGEST_TREE_SIZE,
  MEDIUM_TREE_SIZE,
  SEED_TREE_SIZE,
  SMALL_TREE_SIZE,
} from "../model/Tree";
import determineGameStateAfterGrowAction from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import { getBestSeedAction } from "./seedingStrategy";
import { getGrowOrCompleteActionForSpookedTrees } from "./completeTreesStrategy";
import { HIGH_RICHNESS } from "../model/Cell";
import StaticCellData from "../model/StaticCellData";

const getActionForSunPointSaverStrategy = (
  game: Game,
  staticCellData: StaticCellData
): Action => {
  const bestGrowOrCompleteAction = getGrowOrCompleteActionForSpookedTrees(game);
  const freeSeedAction = getBestSeedAction(staticCellData, game);
  const bestGrowAction = getGrowActionWithBestSunPointPayoff(
    game,
    staticCellData
  );

  //todo (mv): if the growOrCoplete action is a GROW that would garner no sun points, prefer the bestGrowAction if it exists
  if (bestGrowOrCompleteAction !== null) {
    if (bestGrowOrCompleteAction.type === "GROW" && bestGrowAction !== null) {
      const newGameState1 = determineGameStateAfterGrowAction(
        game,
        bestGrowOrCompleteAction.targetCellIdx
      );
      const sunPointsAfterCollection1 =
        newGameState1.myPlayer.sunPoints +
        calculateSunPointsGainedForDay(
          staticCellData.directionDistanceTracker,
          newGameState1.cells,
          newGameState1.myPlayer,
          newGameState1.getAllTrees(),
          newGameState1.day + 1
        );

      const newGameState2 = determineGameStateAfterGrowAction(
        game,
        bestGrowAction.targetCellIdx
      );
      const sunPointsAfterCollection2 =
        newGameState2.myPlayer.sunPoints +
        calculateSunPointsGainedForDay(
          staticCellData.directionDistanceTracker,
          newGameState2.cells,
          newGameState2.myPlayer,
          newGameState2.getAllTrees(),
          newGameState2.day + 1
        );

      if (sunPointsAfterCollection1 >= sunPointsAfterCollection2) {
        console.error("===== Trying to grow/complete spooked trees early!");
        return bestGrowOrCompleteAction;
      }
    } else {
      console.error("===== Trying to grow/complete spooked trees early!");
      return bestGrowOrCompleteAction;
    }
  }

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
  const { myPlayer } = game;
  const myTrees = myPlayer.getTrees();
  const tooManySmallTrees: boolean =
    myTrees.filter((tree) => tree.size === SMALL_TREE_SIZE).length >= 1;
  const tooManyLargeTrees: boolean =
    myTrees.filter((tree) => tree.size === LARGEST_TREE_SIZE).length >= 3;
  const { sunPoints: mySunPoints } = myPlayer;
  let bestTree: Tree = null;
  let mostResultingSunPoints: Number = -1;

  myTrees.forEach((tree) => {
    if (tooManySmallTrees && tree.size === SEED_TREE_SIZE) {
      return;
    }
    if (tooManyLargeTrees && tree.size === MEDIUM_TREE_SIZE) {
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
        // TODO better tie breaking than just going with the first one
        if (mostResultingSunPoints < sunPointsAfterCollection) {
          mostResultingSunPoints = sunPointsAfterCollection;
          bestTree = tree;
        }
      }
    }
  });

  return bestTree?.getNextAction() || null;
};

export default getActionForSunPointSaverStrategy;

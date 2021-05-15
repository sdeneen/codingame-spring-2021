import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree from "../model/Tree";
import determineGameStateAfterGrowAction from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import { getHighestRichnessFreeSeedAction } from "./seedingStrategy";
import { getCompleteActionForSpookedTrees } from "./completeTreesStrategy";
import { HIGH_RICHNESS } from "../model/Cell";

const getActionForSunPointSaverStrategy = (game: Game): Action => {
  const bestCompleteAction = getCompleteActionForSpookedTrees(game);
  if (bestCompleteAction !== null) {
    console.error("===== Completing early!");
    return bestCompleteAction;
  }
  const freeSeedAction = getHighestRichnessFreeSeedAction(game);
  const bestGrowAction = getGrowActionWithBestSunPointPayoff(game);

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

const getGrowActionWithBestSunPointPayoff = (game: Game): Action | null => {
  const { myPlayer } = game;
  const myTrees = myPlayer.getTrees();
  const { sunPoints: mySunPoints } = myPlayer;
  let bestTree: Tree = null;
  let mostResultingSunPoints: Number = -1;

  myTrees.forEach((tree) => {
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

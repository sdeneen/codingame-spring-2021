import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree from "../model/Tree";
import determineGameStateAfterGrowAction from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import { getHighestRichnessFreeSeedAction } from "./seedingStrategy";

const getActionForSunPointSaverStrategy = (game: Game): Action => {
    const bestGrowAction = getGrowActionWithBestSunPointPayoff(game);
    if (bestGrowAction !== null) {
        return bestGrowAction;
    }
    const freeSeedAction = getHighestRichnessFreeSeedAction(game);
    if (freeSeedAction !== null) {
        return freeSeedAction;
    }

    return new Action("WAIT");
}

const getGrowActionWithBestSunPointPayoff = (game: Game): Action | null => {
    const { myPlayer } = game;
    const myTrees = myPlayer.getTrees();
    const { sunPoints: mySunPoints } = myPlayer;
    let bestTree: Tree = null;
    let mostResultingSunPoints: Number = -1;

    myTrees.forEach(tree => {
        const nextAction = tree.getNextAction()
        if (nextAction?.type === "GROW") {
            const growthCost = calculateTreeActionCost(myTrees, nextAction.type, tree)
            if (growthCost <= mySunPoints) {
                const newGameState = determineGameStateAfterGrowAction(game, nextAction.targetCellIdx);
                newGameState.opponentPlayer.sunPoints = -5;
                const sunPointsAfterCollection = newGameState.myPlayer.sunPoints + calculateSunPointsGainedForDay(newGameState.cells, newGameState.myPlayer, newGameState.getAllTrees(), newGameState.day + 1);
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


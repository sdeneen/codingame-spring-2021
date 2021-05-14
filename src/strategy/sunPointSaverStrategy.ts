import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree from "../model/Tree";
import findCellsWithinDistance from "../graphTraversal";
import determineGameStateAfterGrowAction from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";

const getActionForSunPointSaverStrategy = (game: Game): Action => {
    const bestGrowAction = getGrowActionWithBestSunPointPayoff(game);
    if (bestGrowAction !== null) {
        return bestGrowAction;
    }
    const freeSeedAction = getFreeSeed(game);
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

const getFreeSeed = (game: Game): Action | null => {
    const { myPlayer } = game;
    const myTrees = myPlayer.getTrees();
    for (let i = 0; i < myTrees.length; i++) {
        const tree = myTrees[i];
        if (!tree.isDormant) {
            if (calculateTreeActionCost(myTrees, "SEED", tree) === 0) {
                const freeCells = findCellsWithinDistance(game.cells, tree.cellIndex, 1).filter(cell => !cell.isOccupied && cell.richness > 0);
                if (freeCells.length === 0) {
                    continue;
                }
                return new Action("SEED", tree.cellIndex, freeCells[0].index)
            }
            
        }
    }
    
    return null;

}

export default getActionForSunPointSaverStrategy;


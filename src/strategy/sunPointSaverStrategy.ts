import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import { getTrashTalk } from "../utils/trashTalker";
import Tree from "../model/Tree";
import findCellsWithinDistance from "../graphTraversal";
import Cell from "../model/Cell";

const getActionForSunPointSaverStrategy = (game: Game): Action => {
    const cheapestGrowthAction = getCheapestGrowAction(game);
    if (cheapestGrowthAction !== null) {
        return cheapestGrowthAction;
    }
    const freeSeedAction = getFreeSeed(game);
    if (freeSeedAction !== null) {
        return freeSeedAction;
    }

    return new Action("WAIT");
}

const getCheapestGrowAction = (game: Game): Action | null => {
    const { myPlayer: { sunPoints:mySunPoints, trees:myTrees } } = game;
    let cheapestTreeToGrow: Tree = null;
    let cheapestCost: Number = Number.MAX_VALUE;

    for (let i = 0; i < myTrees.length; i++) {
        const tree = myTrees[i];
        const nextAction = tree.getNextAction()
        if (nextAction?.type === "GROW") {
            const growthCost = calculateTreeActionCost(myTrees, nextAction.type, tree)
            if (growthCost <= mySunPoints && growthCost < cheapestCost) {
                cheapestCost = growthCost;
                cheapestTreeToGrow = tree;
            }
        }
    }
    
    return cheapestTreeToGrow?.getNextAction() || null;
}

const getFreeSeed = (game: Game): Action | null => {
    const { myPlayer: { sunPoints:mySunPoints, trees:myTrees } } = game;
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


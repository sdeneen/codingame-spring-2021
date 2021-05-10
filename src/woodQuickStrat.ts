import Game from "./model/Game";
import calculateTreeActionCost from "./cost/ActionCostCalculator";
import Action from "./model/Action";
import { getTrashTalk } from "./utils/trashTalker";
import Tree from "./model/Tree";
import findCellsWithinDistance from "./graphTraversal";
import Cell from "./model/Cell";

const woodQuickStrat = (game: Game) => {
    const cheapestGrowthAction = getCheapestGrowAction(game);
    if (cheapestGrowthAction !== null) {
        console.log(`${cheapestGrowthAction} ${getTrashTalk()}`);
        return;
    }

    const freeSeedAction = getFreeSeedOrNull(game);
    if (freeSeedAction !== null) {
        console.log(`${freeSeedAction} ${getTrashTalk}`)
    }

    console.log(new Action("WAIT").toString());
}

const getCheapestGrowAction = (game: Game): Action => {
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
    
    return cheapestTreeToGrow?.getNextAction();
}

const getFreeSeedOrNull = (game: Game): Action => {
    const { myPlayer: { sunPoints:mySunPoints, trees:myTrees } } = game;
    for (let i = 0; i < myTrees.length; i++) {
        const tree = myTrees[i];
        if (!tree.isDormant) {
            if (calculateTreeActionCost(myTrees, "SEED", tree) === 0) {
                const freeCells = findCellsWithinDistance(game.cells, tree.cellIndex, 1).filter(cell => !cell.isOccupied);
                if (freeCells.length === 0) {
                    continue;
                }
                return new Action("SEED", tree.cellIndex, freeCells[0].index)
            }
            
        }
    }
    
    return null;

}

export default woodQuickStrat;

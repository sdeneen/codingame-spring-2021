import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Tree from "../model/Tree";

const getActionForSunPointSaverStrategy = (game: Game): Action => {
    const cheapestGrowthAction = getCheapestGrowAction(game);

    if (cheapestGrowthAction !== null) {
        return cheapestGrowthAction;
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
            const growthCost = calculateTreeActionCost(myTrees, nextAction, tree)
            if (growthCost <= mySunPoints && growthCost < cheapestCost) {
                cheapestCost = growthCost;
                cheapestTreeToGrow = tree;
            }
        }
    }
    
    return cheapestTreeToGrow?.getNextAction() || null;
}

export default getActionForSunPointSaverStrategy;

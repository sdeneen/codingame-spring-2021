import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Game from "../model/Game";

/**
 * Strategy that just tries to complete trees as soon as possible, good for late game.
 */
const getActionForCompleteTreesStrategy = (game: Game): Action | null => {
    const maxTreesToConsider = 3;
    const { myPlayer, cells } = game;
    const { sunPoints } = myPlayer;
    const trees = myPlayer.getTrees();
    trees.sort((tree1, tree2) => {
        // Prioritize largest size first (closest to completion)
        if (tree2.size !== tree1.size) {
            return tree2.size - tree1.size;
        }

        // TODO this could also prioritize based on how many sun points we expect to receive from this tree in future turn(s)
        // Then prioritize richness
        const richness1 = cells[tree1.cellIndex].richness;
        const richness2 = cells[tree2.cellIndex].richness;
        return richness2 - richness1;
    });

    const numTreesToConsider = Math.min(trees.length, maxTreesToConsider);
    for (let i = 0; i < numTreesToConsider; i++) {
        const curTree = trees[i];
        const actionForTree = curTree.getNextAction();
        if (actionForTree !== null) {
            const cost = calculateTreeActionCost(trees, actionForTree.type, curTree);
            if (sunPoints >= cost) {
                return actionForTree;
            }
        }
    }

    return new Action("WAIT");
};

export default getActionForCompleteTreesStrategy;

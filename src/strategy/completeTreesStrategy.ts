import calculateTreeActionCost, { COST_TO_COMPLETE_TREE } from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Game from "../model/Game";
import { NUM_DIRECTIONS } from "../miscConstants";
import Tree, { LARGE_TREE_SIZE, MEDIUM_TREE_SIZE } from "../model/Tree";
import { getTreesThatCastSpookyShadowOnTree } from "../shadowObserver";

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

/**
 * Strategy that finds trees that are able to be completed (Size 3) and 
 * would not garner sun points for the next N days.
 * 
 * Note: this is a prediction since the oppo can grow a tree during the next day that causes 
 *       future days to be spooked
 */
const getCompleteActionForSpookedTrees = (game: Game): Action | null => {
    if (game.myPlayer.sunPoints >= COST_TO_COMPLETE_TREE) {
        const wastedTrees = getAllWastedTrees(game, 2);
     
        if (wastedTrees.length !== 0) {
            // todo optimize: if there are multiple, pick best option (richness?, most wasted days?, least oppo blocking?)
            return wastedTrees.reduce((t1, t2) => game.cells[t1.cellIndex].richness > game.cells[t2.cellIndex].richness ? t1 : t2).getNextAction();
        }
    }
    return null;
}

const getAllWastedTrees = (game: Game, wastedDays: number): Tree[] => {
    const treesToConsider: Tree[] = getTreesToConsider(game.myPlayer.getTrees());
    let wastedTrees: Tree[] = []

    for (let index = 0; index < treesToConsider.length; index++) {
        const tree: Tree = treesToConsider[index];
        let areAllDaysWasted: boolean = true;

        for (let i = 1; i <= wastedDays; i++) {
            const treesCastingSpookyShadows = getTreesThatCastSpookyShadowOnTree(game.cells, game.day + i, tree);
            if (treesCastingSpookyShadows.length === 0) {
                // No need to continue checking since
                // at least one day of the N days will get sun points
                areAllDaysWasted = false;
                break;
            }
        }

        if (areAllDaysWasted) {
            wastedTrees.push(tree);
        }
    }

    return wastedTrees;
}

const getTreesToConsider = (trees: Tree[]): Tree[] => {
    return trees.filter(tree => (tree.size === LARGE_TREE_SIZE || tree.size === MEDIUM_TREE_SIZE) && !tree.isDormant);
}

export { getActionForCompleteTreesStrategy, getCompleteActionForSpookedTrees }

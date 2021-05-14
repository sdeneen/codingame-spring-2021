import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Game from "../model/Game";
import { NUM_DIRECTIONS } from "../miscConstants";
import Tree from "../model/Tree";

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
    const wastedTrees = getAllWastedTrees(game, 2);
    if (wastedTrees.length !== 0) {
        console.error(`${wastedTrees.length} wasteable trees`);
        return wastedTrees[0].getNextAction();
    }
    return null;
}

const getAllWastedTrees = (game: Game, wastedDays: number): Tree[] => {
    const curSunDirection: number = game.day % NUM_DIRECTIONS;
    const myCompletableTrees: Tree[] = game.myPlayer.getTrees().filter(tree => tree.size === 3 && !tree.isDormant);
    let wastedTrees: Tree[] = []

    for (let index = 0; index < myCompletableTrees.length; index++) {
        const tree: Tree = myCompletableTrees[index];
        let areAllDaysWasted: boolean = true;

        for (let i = 1; i <= wastedDays; i++) {
            console.error(tree);
            // put literal 3 as variable and put this in new method
            const neighborIndexToCheck = (curSunDirection + i + 3) % NUM_DIRECTIONS;
            console.error(`shade direction index ${neighborIndexToCheck}`);
            let curNeighborCellToCheck: number = game.cells[tree.cellIndex].neighbors[neighborIndexToCheck];
            console.error(`neighbor cell index ${curNeighborCellToCheck}`);
            let isCheckedDayWasted: boolean = false;
            while (curNeighborCellToCheck != -1) {
                if (game.cells[curNeighborCellToCheck].tree?.size >= tree.size) {
                    isCheckedDayWasted = true;
                    // at least one neighbor is throwing shade on the tree
                    break;
                }
                curNeighborCellToCheck = game.cells[curNeighborCellToCheck].neighbors[neighborIndexToCheck];
            }
            if (!isCheckedDayWasted) {
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

export { getActionForCompleteTreesStrategy, getCompleteActionForSpookedTrees }

import Tree, { LARGEST_TREE_SIZE } from "./model/Tree";
import Cell from "./model/Cell";
import { NUM_DIRECTIONS } from './miscConstants';
import Game from "./model/Game";

/**
 * Finds all cells that the sourceTree casts a shadow on when it is the given day.
 */
const getCellsInTreeShadow = (cells: Cell[], sourceTree: Tree, day: number): Cell[] => {
    const sunDirection = day % NUM_DIRECTIONS;
    let remainingShadowCells = sourceTree.size;
    const cellsInShadow = [];
    let curCell = cells[sourceTree.cellIndex];
    while (remainingShadowCells > 0) {
        const neighborIndex = curCell.neighbors[sunDirection];
        if (neighborIndex < 0) {
            // We've reached the edge of the board, so just return what we have
            return cellsInShadow;
        }

        // This cell is in the shadow!
        curCell = cells[neighborIndex];
        cellsInShadow.push(curCell);
        remainingShadowCells--;
    }

    return cellsInShadow;
};

/**
 * Finds all trees that will not get sun on the given day becauase they are in {sourceTree} tree's shadow.
 */
const getTreesThatAreBlockedByTreeShadow = (cells: Cell[], allTrees: Tree[], sourceTree: Tree, day: number): Tree[] => {
    const cellsInShadow = getCellsInTreeShadow(cells, sourceTree, day);
    const shadowedCellIndices = new Set(cellsInShadow.map(c => c.index));
    return allTrees.filter(t => shadowedCellIndices.has(t.cellIndex) && t.size <= sourceTree.size);
};

/**
 * Finds all trees that are blocked by any other tree's shadow on the given day.
 */
const getAllTreesThatAreBlockedByAnyShadow = (cells: Cell[], allTrees: Tree[], day: number): Tree[] => {
    const cellIndexToLargestShadow = {};
    allTrees.forEach(tree => {
        const cellsInShadow = getCellsInTreeShadow(cells, tree, day);
        cellsInShadow.forEach(({ index }) => {
            if (cellIndexToLargestShadow[index] === undefined || cellIndexToLargestShadow[index] < tree.size) {
                cellIndexToLargestShadow[index] = tree.size;
            }
        });
    });

    return allTrees.filter(tree => cellIndexToLargestShadow[tree.cellIndex] !== undefined && cellIndexToLargestShadow[tree.cellIndex] >= tree.size);
};

const getTreesThatCastSpookyShadowOnTree = (allCells: Cell[], day: number, targetTree: Tree): Tree[] => {
    const neighborIndexToCheck = getOppositeDirectionOfSun(day);
    let curNeighborCellToCheck: number = allCells[targetTree.cellIndex].neighbors[neighborIndexToCheck];
    let treesCastingSpookyShadows = [];
    let neighborDistance = 1;

    while (curNeighborCellToCheck !== -1 && neighborDistance <= LARGEST_TREE_SIZE) {
        if (allCells[curNeighborCellToCheck].tree?.size >= targetTree.size) {
            treesCastingSpookyShadows.push(allCells[curNeighborCellToCheck].tree);
        }
        curNeighborCellToCheck = allCells[curNeighborCellToCheck].neighbors[neighborIndexToCheck];
        neighborDistance++;
    }

    return treesCastingSpookyShadows;
}

const getOppositeDirectionOfSun = (day: number) => {
    const sunDirectionOnDay: number = day % NUM_DIRECTIONS;
    const indicesForOppositeDirection = NUM_DIRECTIONS / 2;
    return (sunDirectionOnDay + indicesForOppositeDirection) % NUM_DIRECTIONS
}

export { getCellsInTreeShadow, getTreesThatAreBlockedByTreeShadow, getAllTreesThatAreBlockedByAnyShadow, getTreesThatCastSpookyShadowOnTree};

import Tree from "./model/Tree";
import Cell from "./model/Cell";
import { NUM_DIRECTIONS } from './miscConstants';

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
}

export { getCellsInTreeShadow, getTreesThatAreBlockedByTreeShadow };

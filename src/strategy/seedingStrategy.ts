import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import findCellsWithinDistance from "../graphTraversal";
import Cell from "../model/Cell";

const getHighestRichnessFreeSeedAction = (game: Game): Action | null => {
    const freeSeedActions = getFreeSeedActions(game);
    // todo (mv): if next to two or more myPlayer trees, filter it out
    if (freeSeedActions.length === 0) {
        return null;
    }
    // todo (mv): if multiple, pick furtherest away
    let mostRichSeedableCell = freeSeedActions.reduce(
        (prev, cur) => (game.cells[prev.targetCellIdx].richness > game.cells[cur.targetCellIdx].richness) ? prev : cur
    )
    return mostRichSeedableCell
}

const getFreeSeedActions = (game: Game): Action[] => {
    const { myPlayer } = game;
    const myTrees = myPlayer.getTrees();
    let seedActions: Action[] = []

    for (let i = 0; i < myTrees.length; i++) {
        const tree = myTrees[i];
        if (!tree.isDormant) {
            if (calculateTreeActionCost(myTrees, "SEED", tree) === 0) {
                const freeCells = findCellsWithinDistance(game.cells, tree.cellIndex, tree.size).filter(cell => !cell.isOccupied && cell.richness > 0);
                const freeSpaciousCells = filterOutCrowdedCells(game, freeCells);
                freeSpaciousCells.forEach(cell => seedActions.push(new Action("SEED", tree.cellIndex, cell.index)));
            }
        }
    }
    
    return seedActions;
}

const filterOutCrowdedCells = (game: Game, seedableCells: Cell[]): Cell[] => {
    return seedableCells.filter(seedableCell => {
        const numNeighbors = seedableCell.getNeighborCellIndices().filter(cellIndx => game.cells[cellIndx].isOccupied).length;
        return numNeighbors < 2;
    });
}

export { getHighestRichnessFreeSeedAction }

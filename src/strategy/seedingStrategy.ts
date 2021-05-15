import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import findCellsWithinDistance from "../graphTraversal";
import Cell, { HIGH_RICHNESS, UNUSABLE_RICHNESS } from "../model/Cell";
import { MEDIUM_TREE_SIZE } from "../model/Tree";

const getHighestRichnessFreeSeedAction = (game: Game): Action | null => {
  const freeSeedActions = getFreeSeedActions(game);
  if (freeSeedActions.length === 0) {
    return null;
  }
  // todo (mv): if multiple, pick furtherest away
  let mostRichSeedableCell = freeSeedActions.reduce((prev, cur) =>
    game.cells[prev.targetCellIdx].richness >
    game.cells[cur.targetCellIdx].richness
      ? prev
      : cur
  );
  return mostRichSeedableCell;
};

const getFreeSeedActions = (game: Game): Action[] => {
  const { myPlayer } = game;
  const myTrees = myPlayer.getTrees();
  const mediumPlusTrees = myTrees.filter(
    (tree) => tree.size >= MEDIUM_TREE_SIZE
  );
  let seedActions: Action[] = [];

  for (let i = 0; i < mediumPlusTrees.length; i++) {
    const tree = mediumPlusTrees[i];
    if (!tree.isDormant) {
      if (calculateTreeActionCost(myTrees, "SEED", tree) === 0) {
        const freeCells = findCellsWithinDistance(
          game.cells,
          tree.cellIndex,
          tree.size
        ).filter(
          (cell) => !cell.isOccupied() && cell.richness > UNUSABLE_RICHNESS
        );
        const freeSpaciousOrNutritiousCells =
          filterForSpaciousOrNutrientDenseCells(game, freeCells);
        freeSpaciousOrNutritiousCells.forEach((cell) =>
          seedActions.push(new Action("SEED", tree.cellIndex, cell.index))
        );
      }
    }
  }

  return seedActions;
};

const filterForSpaciousOrNutrientDenseCells = (
  game: Game,
  seedableCells: Cell[]
): Cell[] => {
  return seedableCells.filter((seedableCell) => {
    const numNeighbors = seedableCell
      .getNeighborCellIndices()
      .filter((cellIndx) => game.cells[cellIndx].isOccupied()).length;
    return (
      numNeighbors < 2 ||
      (seedableCell.richness === HIGH_RICHNESS && numNeighbors < 3)
    );
  });
};

export { getHighestRichnessFreeSeedAction };

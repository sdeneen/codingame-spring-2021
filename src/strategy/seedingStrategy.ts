import Game from "../model/Game";
import calculateTreeActionCost, {
  calculateSeedCost,
} from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import findCellsWithinDistance from "../graphTraversal";
import Cell, { HIGH_RICHNESS, UNUSABLE_RICHNESS } from "../model/Cell";
import Tree, { MEDIUM_TREE_SIZE } from "../model/Tree";
import StaticCellData from "../model/StaticCellData";
import DirectionDistanceTracker from "../model/DirectionDistanceTracker";
import { NUM_DIRECTIONS } from "../miscConstants";

/**
 * Only allows free seed actions.
 * Makes sure not to try seeding on a cell that has unusable richness.
 * Only allows seeding from source trees of size medium or larger.
 * Optimizes to avoid blocking our trees later (using a strategy known as the "L" strat)
 */
const getBestSeedAction = (
  staticCellData: StaticCellData,
  game: Game
): Action | null => {
  const { cells, myPlayer } = game;
  const myTrees = myPlayer.getTrees();
  const seedCost = calculateSeedCost(myTrees);
  if (seedCost > 0) {
    return null;
  }

  const seedActions = findSeedActionsUsingTheLStrategy(
    staticCellData.directionDistanceTracker,
    cells,
    myTrees
  );
  if (seedActions.length === 0) {
    // TODO consider seeding a high richness cell even if it doesn't follow the L strategy
    return null;
  }

  return seedActions.reduce((action1, action2) => {
    // TODO we could consider the source cell as well (i.e. pick source cells we wouldn't want to grow as much today)
    const targetCell1 = cells[action1.targetCellIdx];
    const targetCell2 = cells[action2.targetCellIdx];
    const numOccupiedNeighbors1 = targetCell1
      .getNeighborCellIndices()
      .filter((i) => cells[i].isOccupied()).length;
    const numOccupiedNeighbors2 = targetCell2
      .getNeighborCellIndices()
      .filter((i) => cells[i].isOccupied()).length;
    const richness1 = targetCell1.richness;
    const richness2 = targetCell2.richness;
    // Evenly weight the difference between richness and the difference between the number of occupied neighbors
    // TODO this could be improved. Also should there be a tie breaker here? Probably based on source cell
    return richness1 - numOccupiedNeighbors1 > richness2 - numOccupiedNeighbors2
      ? action1
      : action2;
  });
};

const findSeedActionsUsingTheLStrategy = (
  distanceTracker: DirectionDistanceTracker,
  allCells: Cell[],
  allMyTrees: Tree[]
): Action[] => {
  const seedActionsToReturn = [];
  const sourceTreeCandidates = allMyTrees.filter(
    (tree) => tree.size >= MEDIUM_TREE_SIZE && !tree.isDormant
  );
  sourceTreeCandidates.forEach((sourceTree) => {
    for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
      const firstNeighborCellIndex =
        allCells[sourceTree.cellIndex].neighbors[direction];
      if (firstNeighborCellIndex === -1) {
        // Nothing in this direction... keep going with a new direction
        continue;
      }
      const firstNeighborCell = allCells[firstNeighborCellIndex];
      const directionsToConsiderForSecondNeighbor = [
        (direction + 1) % NUM_DIRECTIONS,
        (direction + NUM_DIRECTIONS - 1) % NUM_DIRECTIONS,
      ];
      directionsToConsiderForSecondNeighbor.forEach((newDirection) => {
        const secondNeighborCellIndex =
          firstNeighborCell.neighbors[newDirection];
        const secondNeighborCell = allCells[secondNeighborCellIndex];
        if (
          secondNeighborCellIndex !== -1 &&
          secondNeighborCell.richness > UNUSABLE_RICHNESS &&
          !secondNeighborCell.isOccupied()
        ) {
          seedActionsToReturn.push(
            new Action("SEED", sourceTree.cellIndex, secondNeighborCellIndex)
          );
        }
      });
    }
  });

  return seedActionsToReturn;
};

const getHighestRichnessFreeSeedAction = (game: Game): Action | null => {
  const freeSeedActions = getFreeSeedActions(game);
  if (freeSeedActions.length === 0) {
    return null;
  }
  // todo (mv): if multiple, pick furtherest away
  return freeSeedActions.reduce((prev, cur) =>
    game.cells[prev.targetCellIdx].richness >
    game.cells[cur.targetCellIdx].richness
      ? prev
      : cur
  );
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
      (seedableCell.richness === HIGH_RICHNESS && numNeighbors < 3) // Consider excluding seeds as real neighbors
    );
  });
};

export { getBestSeedAction, getHighestRichnessFreeSeedAction };

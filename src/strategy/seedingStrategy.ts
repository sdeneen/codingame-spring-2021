import Game from "../model/Game";
import { calculateSeedCost } from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Cell, {
  HIGH_RICHNESS,
  LOW_RICHNESS,
  MEDIUM_RICHNESS,
  UNUSABLE_RICHNESS,
} from "../model/Cell";
import Tree, {
  LARGE_TREE_SIZE,
  LARGEST_TREE_SIZE,
  MEDIUM_TREE_SIZE,
} from "../model/Tree";
import StaticCellData from "../model/StaticCellData";
import { NUM_DIRECTIONS } from "../miscConstants";
import { getTreesInGivenShadow, TreeWithDistance } from "../shadowObserver";
import DirectionDistanceTracker from "../model/DirectionDistanceTracker";

const getInverseDistanceSumForTreesWithDistance = (
  treesWithDistance: TreeWithDistance[]
): number =>
  treesWithDistance.reduce<number>(
    (sumSoFar, treeWithDistance) => sumSoFar + 1 / treeWithDistance.distance,
    0
  );

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
  const { directionDistanceTracker } = staticCellData;
  const myTrees = myPlayer.getTrees();
  const seedCost = calculateSeedCost(myTrees);
  if (seedCost > 0) {
    return null;
  }

  const lStrategySeedActions = findSeedActionsUsingTheLStrategy(cells, myTrees);
  const filteredLStrategySeedActions = filterOutBadSeedActions(
    directionDistanceTracker,
    cells,
    myTrees,
    lStrategySeedActions
  );
  const bestLStrategySeedAction = pickBestSeedAction(
    directionDistanceTracker,
    cells,
    myTrees,
    filteredLStrategySeedActions
  );
  if (bestLStrategySeedAction !== null) {
    return bestLStrategySeedAction;
  }

  const distanceThreeSeedActions = findDistanceThreeSeedActions(
    staticCellData,
    cells,
    myTrees
  );
  const filteredDistanceThreeSeedActions = filterOutBadSeedActions(
    directionDistanceTracker,
    cells,
    myTrees,
    distanceThreeSeedActions
  );
  return pickBestSeedAction(
    directionDistanceTracker,
    cells,
    myTrees,
    filteredDistanceThreeSeedActions
  );
};

const findDistanceThreeSeedActions = (
  staticCellData: StaticCellData,
  allCells: Cell[],
  allMyTrees: Tree[]
) => {
  const myLargeTrees = allMyTrees.filter(
    (tree) => tree.size === LARGE_TREE_SIZE
  );
  const distanceTracker = staticCellData.directionDistanceTracker;
  const actions = [];
  myLargeTrees.forEach((tree) => {
    const cellIndicesToConsider =
      distanceTracker.getCellIndiciesAtDistanceInAnyDirection(
        tree.cellIndex,
        3
      );
    cellIndicesToConsider.map((targetCellIndex) => {
      const cell = allCells[targetCellIndex];
      if (cell.richness > UNUSABLE_RICHNESS && !cell.isOccupied()) {
        actions.push(new Action("SEED", tree.cellIndex, targetCellIndex));
      }
    });
  });

  return actions;
};

const findSeedActionsUsingTheLStrategy = (
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

const filterOutBadSeedActions = (
  distanceTracker: DirectionDistanceTracker,
  allCells: Cell[],
  myTrees: Tree[],
  seedActions: Action[]
): Action[] => {
  return seedActions.filter((action) => {
    const targetCell = allCells[action.targetCellIdx];

    const potentialTreesToBlock = getTreesInGivenShadow(
      distanceTracker,
      allCells,
      myTrees,
      targetCell.index,
      LARGEST_TREE_SIZE
    );
    // Higher distance is better (less likely to block), so we sum up the inverse
    const inverseDistanceSum = getInverseDistanceSumForTreesWithDistance(
      potentialTreesToBlock
    );

    // Some helper math to provide some context for the numbers we check below:
    // blocking two distance 3's, two distance 2's, and a distance 1: 2 and 2/3
    // blocking two distance 1's = 2
    // blocking a distance 1, 2, and 3 = 1 and 5/6
    // blocking two distance 3's = 2/3
    if (targetCell.richness === HIGH_RICHNESS) {
      return inverseDistanceSum <= 4;
    }
    if (targetCell.richness === MEDIUM_RICHNESS) {
      return inverseDistanceSum <= 3;
    }
    if (targetCell.richness === LOW_RICHNESS) {
      return inverseDistanceSum <= 2;
    }

    return false;
  });
};

const pickBestSeedAction = (
  distanceTracker: DirectionDistanceTracker,
  allCells: Cell[],
  myTrees: Tree[],
  seedActions: Action[]
): Action | null => {
  if (seedActions.length === 0) {
    return null;
  }

  return seedActions.reduce((action1, action2) => {
    // TODO we could consider the source cell as well (i.e. pick source cells we wouldn't want to grow as much today)
    if (action1.targetCellIdx === action2.targetCellIdx) {
      return action2;
    }

    const targetCell1 = allCells[action1.targetCellIdx];
    const targetCell2 = allCells[action2.targetCellIdx];
    const numOccupiedNeighbors1 = targetCell1
      .getNeighborCellIndices()
      .filter((i) => allCells[i].isOccupied()).length;
    const numOccupiedNeighbors2 = targetCell2
      .getNeighborCellIndices()
      .filter((i) => allCells[i].isOccupied()).length;
    const richness1 = targetCell1.richness;
    const richness2 = targetCell2.richness;

    const potentialTreesToBlock1 = getTreesInGivenShadow(
      distanceTracker,
      allCells,
      myTrees,
      targetCell1.index,
      LARGEST_TREE_SIZE
    );
    const potentialTreesToBlock2 = getTreesInGivenShadow(
      distanceTracker,
      allCells,
      myTrees,
      targetCell2.index,
      LARGEST_TREE_SIZE
    );
    // Higher distance is better (less likely to block), so we sum up the inverse
    const inverseDistanceSum1 = getInverseDistanceSumForTreesWithDistance(
      potentialTreesToBlock1
    );
    const inverseDistanceSum2 = getInverseDistanceSumForTreesWithDistance(
      potentialTreesToBlock2
    );

    // Evenly weight the difference between richness and the difference between the number of occupied neighbors and the difference between distance inverse sum
    // TODO this could be improved. Also should there be a tie breaker here? Probably based on source cell
    return richness1 - numOccupiedNeighbors1 - inverseDistanceSum1 >
      richness2 - numOccupiedNeighbors2 - inverseDistanceSum2
      ? action1
      : action2;
  });
};

export { getBestSeedAction };

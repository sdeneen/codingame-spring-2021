import Tree, { LARGEST_TREE_SIZE } from "./model/Tree";
import Cell from "./model/Cell";
import { NUM_DIRECTIONS } from "./miscConstants";
import DirectionDistanceTracker from "./model/DirectionDistanceTracker";
import { Direction, ShadowDistance } from "./miscTypes";

/**
 * Finds all cells that the sourceTree casts a shadow on when it is the given day.
 */
const getCellsInTreeShadow = (
  sameDirectionDistanceTracker: DirectionDistanceTracker,
  allCells: Cell[],
  sourceTree: Tree,
  day: number
): Cell[] => {
  const sunDirection = (day % NUM_DIRECTIONS) as Direction;
  const { size } = sourceTree;
  if (size === 0) {
    // Seeds have no shadow
    return [];
  }
  const cellsIndiciesInShadow =
    sameDirectionDistanceTracker.getCellIndiciesInDirectionWithinDistance(
      sourceTree.cellIndex,
      sunDirection,
      // @ts-ignore - size always <= 3
      size
    );
  return cellsIndiciesInShadow.map((i) => allCells[i]);
};

/**
 * Finds all trees that will not get sun on the given day becauase they are in {sourceTree} tree's shadow.
 */
const getTreesThatAreBlockedByTreeShadow = (
  sameDirectionDistanceTracker: DirectionDistanceTracker,
  cells: Cell[],
  allTrees: Tree[],
  sourceTree: Tree,
  day: number
): Tree[] => {
  const cellsInShadow = getCellsInTreeShadow(
    sameDirectionDistanceTracker,
    cells,
    sourceTree,
    day
  );
  const shadowedCellIndices = new Set(cellsInShadow.map((c) => c.index));
  return allTrees.filter(
    (t) => shadowedCellIndices.has(t.cellIndex) && t.size <= sourceTree.size
  );
};

/**
 * Finds all trees that are blocked by any other tree's shadow on the given day.
 */
const getAllTreesThatAreBlockedByAnyShadow = (
  sameDirectionDistanceTracker: DirectionDistanceTracker,
  cells: Cell[],
  allTrees: Tree[],
  day: number
): Tree[] => {
  const cellIndexToLargestShadow = {};
  allTrees.forEach((tree) => {
    const cellsInShadow = getCellsInTreeShadow(
      sameDirectionDistanceTracker,
      cells,
      tree,
      day
    );
    cellsInShadow.forEach(({ index }) => {
      if (
        cellIndexToLargestShadow[index] === undefined ||
        cellIndexToLargestShadow[index] < tree.size
      ) {
        cellIndexToLargestShadow[index] = tree.size;
      }
    });
  });

  return allTrees.filter(
    (tree) =>
      cellIndexToLargestShadow[tree.cellIndex] !== undefined &&
      cellIndexToLargestShadow[tree.cellIndex] >= tree.size
  );
};

const getTreesThatCastSpookyShadowOnTree = (
  allCells: Cell[],
  day: number,
  targetTree: Tree
): Tree[] => {
  const neighborIndexToCheck = getOppositeDirectionOfSun(day);
  let curNeighborCellToCheck: number =
    allCells[targetTree.cellIndex].neighbors[neighborIndexToCheck];
  let treesCastingSpookyShadows = [];
  let neighborDistance = 1;

  while (
    curNeighborCellToCheck !== -1 &&
    neighborDistance <= LARGEST_TREE_SIZE
  ) {
    if (allCells[curNeighborCellToCheck].tree?.size >= targetTree.size) {
      treesCastingSpookyShadows.push(allCells[curNeighborCellToCheck].tree);
    }
    curNeighborCellToCheck =
      allCells[curNeighborCellToCheck].neighbors[neighborIndexToCheck];
    neighborDistance++;
  }

  return treesCastingSpookyShadows;
};

/**
 * Note: the trees returned aren't necessarily spooked by the given shadow. This just checks if
 * the shadow reaches their cell
 */
const getTreesInGivenShadow = (
  distanceTracker: DirectionDistanceTracker,
  allCells: Cell[],
  treesToCheck: Tree[],
  shadowSourceCellIndex: number,
  shadowSize: ShadowDistance
): Tree[] => {
  const indicesOfCellsWithinShadow =
    distanceTracker.getCellIndiciesWithinDistanceInAnyDirection(
      shadowSourceCellIndex,
      shadowSize
    );
  return indicesOfCellsWithinShadow
    .map((i) => allCells[i].tree)
    .filter((tree) => tree !== null);
};

const getOppositeDirectionOfSun = (day: number) => {
  const sunDirectionOnDay: number = day % NUM_DIRECTIONS;
  const indicesForOppositeDirection = NUM_DIRECTIONS / 2;
  return (sunDirectionOnDay + indicesForOppositeDirection) % NUM_DIRECTIONS;
};

export {
  getCellsInTreeShadow,
  getTreesInGivenShadow,
  getTreesThatAreBlockedByTreeShadow,
  getAllTreesThatAreBlockedByAnyShadow,
  getTreesThatCastSpookyShadowOnTree,
};

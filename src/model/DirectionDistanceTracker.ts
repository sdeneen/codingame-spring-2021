import { NUM_DIRECTIONS } from "../miscConstants";
import { Direction, Distance } from "../miscTypes";
import Cell from "./Cell";

// cell indices at distance 1, 2, and 3 away from some source cell in the same direction
type CellsAtDistance = [number, number, number];

/**
 * Cell index of -1 means that no such cell exists
 */
const calculateCellIndexDistanceMapping = (cells: Cell[]) => {
  const cellIndexToCellsAtDistancePerDirection = {};
  cells.forEach((sourceCell) => {
    const neighbors = sourceCell.neighbors;
    const cellsAtDistanceForEachDirection = [];
    for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
      const cellsAtDistance = [-1, -1, -1];
      let cellIndexToCheck = neighbors[direction];
      let distanceFromSource = 1; // one-based index :O
      while (cellIndexToCheck >= 0 && distanceFromSource <= 3) {
        cellsAtDistance[distanceFromSource - 1] = cellIndexToCheck;
        cellIndexToCheck = cells[cellIndexToCheck].neighbors[direction];
        distanceFromSource++;
      }
      cellsAtDistanceForEachDirection[direction] = cellsAtDistance;
    }

    cellIndexToCellsAtDistancePerDirection[sourceCell.index] =
      cellsAtDistanceForEachDirection;
  });

  return cellIndexToCellsAtDistancePerDirection;
};

/**
 * For every cell C, keeps track of how far other cells are from C in each direction (i.e. a straight line), up
 * to LARGEST_TREE_SIZE away since we don't care about cells that are farther away than that.
 */
export default class DirectionDistanceTracker {
  cellIndexToCellsAtDistancePerDirection: Record<
    number,
    [
      CellsAtDistance,
      CellsAtDistance,
      CellsAtDistance,
      CellsAtDistance,
      CellsAtDistance,
      CellsAtDistance
    ]
  >;

  constructor(allCells: Cell[]) {
    this.cellIndexToCellsAtDistancePerDirection =
      calculateCellIndexDistanceMapping(allCells);
  }

  /**
   * Returns cell indices that are in the given {direction} from the cell at {fromCellIndex},
   * but only up to {maxDistance} cells away.
   */
  getCellIndiciesInDirectionWithinDistance = (
    fromCellIndex: number,
    direction: Direction,
    maxDistance: Distance
  ): number[] => {
    const cellsAtDistance =
      this.cellIndexToCellsAtDistancePerDirection[fromCellIndex][direction];
    const cellIndicesToReturn = [];
    for (let distance = 1; distance <= maxDistance; distance++) {
      const cellIndex = cellsAtDistance[distance - 1];
      if (cellIndex >= 0) {
        cellIndicesToReturn.push(cellIndex);
      }
    }

    return cellIndicesToReturn;
  };
}

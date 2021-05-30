import Tree from "./Tree";
import { coalesce } from "../utils/nullUtils";
import deepCopy from "../utils/deepCopy";

export const UNUSABLE_RICHNESS = 0;
export const LOW_RICHNESS = 1;
export const MEDIUM_RICHNESS = 2;
export const HIGH_RICHNESS = 3;

interface CellFields {
  index: number;
  richness: number;
  neighbors: [number, number, number, number, number, number];
  tree: Tree | null;
}

export default class Cell {
  index: number;
  richness: number;

  /**
   * Indices of neighboring cells, one for each direction (6 directions for a hex board).
   * Beware that some directions may have an index of -1, indicating that there is no neighbor
   * in that direction (i.e. this cell is at the edge of the board)
   */
  neighbors: [number, number, number, number, number, number];

  tree: Tree | null;

  constructor(
    index: number,
    richness: number,
    neighbors: [number, number, number, number, number, number]
  ) {
    this.index = index;
    this.richness = richness;
    this.neighbors = neighbors;
    this.tree = null;
  }

  setTree = (tree: Tree) => {
    this.tree = tree;
  };

  isOccupied = (): boolean => {
    return this.tree !== null;
  };

  /**
   * Get indices of all cells that neighbor this cell.
   */
  getNeighborCellIndices = () =>
    this.neighbors.filter((neighborIndex) => neighborIndex >= 0);

  toString = () => JSON.stringify(this);

  getModifiedDeepCopy = ({
    index,
    richness,
    neighbors,
    tree,
  }: Partial<CellFields>): Cell => {
    const newCell = new Cell(
      coalesce(index, this.index),
      coalesce(richness, this.richness),
      coalesce(neighbors, [...this.neighbors])
    );
    newCell.setTree(coalesce(tree, deepCopy(this.tree)));
    return newCell;
  };

  equals = (other: Cell): boolean =>
    !!other &&
    this.index === other.index &&
    this.richness === other.richness &&
    this.neighbors.length === other.neighbors.length &&
    this.neighbors.every((value, index) => value === other.neighbors[index]) &&
    (this.tree ? this.tree.equals(other.tree) : !other.tree);
}

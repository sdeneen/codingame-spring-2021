import Tree from "./Tree";

export default class Cell {
    index: number;
    richness: number;
    isOccupied: boolean;

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
        this.isOccupied = false;
        this.tree = null;
    }

    setOccupied = () => { 
        this.isOccupied = true
    }

    setTree = (tree: Tree) => {
        this.tree = tree;
    }

    /**
     * Get indices of all cells that neighbor this cell.
     */
    getNeighborCellIndices = () => this.neighbors.filter(neighborIndex => neighborIndex >= 0);

    toString = () => JSON.stringify(this);

    equals = (other: Cell): boolean => this.index === other.index
        && this.richness === other.richness
        && this.isOccupied === other.isOccupied
        && this.neighbors.length === other.neighbors.length
        && this.neighbors.every((value, index) => value === other.neighbors[index]);
}

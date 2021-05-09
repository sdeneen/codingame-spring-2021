export default class Cell {
    index: number;
    richness: number;

    /**
     * Indices of neighboring cells, one for each direction (6 directions for a hex board).
     * Beware that some directions may have an index of -1, indicating that there is no neighbor
     * in that direction (i.e. this cell is at the edge of the board)
     */
    neighbors: [number, number, number, number, number, number];

    constructor(
        index: number,
        richness: number,
        neighbors: [number, number, number, number, number, number]
    ) {
        this.index = index;
        this.richness = richness;
        this.neighbors = neighbors;
    }

    /**
     * Get indices of all cells that neighbor this cell.
     */
    getNeighborCellIndices = () => this.neighbors.filter(neighborIndex => neighborIndex >= 0);
}
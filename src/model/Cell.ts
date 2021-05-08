export default class Cell {
    index: number;
    richness: number;
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
}
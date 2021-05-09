import findCellsWithinDistance from "../src/graphTraversal";
import cellsData from "./data/CellsData";

test('finds cells within 0 from center', () => {
    const resultCells = findCellsWithinDistance(cellsData, 0, 0);
    expect(resultCells).toHaveLength(1);
    expect(resultCells[0].index).toEqual(0);
});

test('finds cells within 1 from center', () => {
    const resultCells = findCellsWithinDistance(cellsData, 0, 1);
    const expectedCellIndices = new Set([0, 1, 2, 3, 4, 5, 6]);
    expect(resultCells).toHaveLength(expectedCellIndices.size);
    const resultCellIndices = resultCells.map(c => c.index);
    expect(resultCellIndices.every(i => expectedCellIndices.has(i))).toBeTruthy();
});

test('finds cells within 2 from center', () => {
    const resultCells = findCellsWithinDistance(cellsData, 0, 2);
    const expectedCellIndices = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    expect(resultCells).toHaveLength(expectedCellIndices.size);
    const resultCellIndices = resultCells.map(c => c.index);
    expect(resultCellIndices.every(i => expectedCellIndices.has(i))).toBeTruthy();
});

test('finds cells within 2 from edge', () => {
    const resultCells = findCellsWithinDistance(cellsData, 28, 2);
    const expectedCellIndices = new Set([28, 27, 13, 29, 26, 12, 4, 14, 30]);
    expect(resultCells).toHaveLength(expectedCellIndices.size);
    const resultCellIndices = resultCells.map(c => c.index);
    expect(resultCellIndices.every(i => expectedCellIndices.has(i))).toBeTruthy();
});
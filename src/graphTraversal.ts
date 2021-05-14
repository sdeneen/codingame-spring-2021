import Cell from "./model/Cell";

const getCellIndexWithMinDistance = (indicesToCheck, cellIndexToDistance) =>
  indicesToCheck.reduce((index1, index2) => {
    const dist1 = cellIndexToDistance[index1];
    const dist2 = cellIndexToDistance[index2];
    if (dist1 === undefined && dist2 === undefined) {
      return dist1;
    } else if (dist1 === undefined) {
      return dist2;
    } else if (dist2 === undefined) {
      return dist1;
    } else {
      return dist1 <= dist2 ? index1 : index2;
    }
  });

/**
 * Traverse the {cells} graph, finding all cells that are within {maxDistance} distance from the cell at index {sourceCellIndex}.
 *
 * Based on Dijkstra's shortest path algo: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Pseudocode
 */
const findCellsWithinDistance = (
  cells: Cell[],
  sourceCellIndex,
  maxDistance: number
): Cell[] => {
  const cellsByIndex = {};
  const cellIndexToDistanceFromSource = {};

  cells.forEach((c) => (cellsByIndex[c.index] = c));

  const indicesToCheck = new Set([sourceCellIndex]);
  cellIndexToDistanceFromSource[sourceCellIndex] = 0;

  while (indicesToCheck.size > 0) {
    const curIndex = getCellIndexWithMinDistance(
      Array.from(indicesToCheck),
      cellIndexToDistanceFromSource
    );
    indicesToCheck.delete(curIndex);
    const curDistanceFromSource = cellIndexToDistanceFromSource[curIndex];

    // Only look at neighbors if we haven't hit our max distance yet, since otherwise they're too far for us to care about them
    if (curDistanceFromSource < maxDistance) {
      const curCell = cells[curIndex];
      const neighborDistanceFromSource = curDistanceFromSource + 1;
      curCell.getNeighborCellIndices().forEach((neighborIndex) => {
        if (
          cellIndexToDistanceFromSource[neighborIndex] === undefined ||
          cellIndexToDistanceFromSource[neighborIndex] >
            neighborDistanceFromSource
        ) {
          cellIndexToDistanceFromSource[neighborIndex] =
            neighborDistanceFromSource;
          indicesToCheck.add(neighborIndex);
        }
      });
    }
  }

  // We've only added cell distances if they are within our max distance
  return Object.keys(cellIndexToDistanceFromSource).map((i) => cellsByIndex[i]);
};

export default findCellsWithinDistance;

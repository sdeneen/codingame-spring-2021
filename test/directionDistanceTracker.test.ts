import cellsData from "./data/CellsData";
import DirectionDistanceTracker from "../src/model/DirectionDistanceTracker";
import { NUM_DIRECTIONS } from "../src/miscConstants";

const assertDistanceTrackerWorksWithoutDirection = (
  tracker,
  fromCellIndex,
  maxDistance,
  directionToExpectedCellIndices
) => {
  const allCellIndiciesWithinDistance =
    tracker.getCellIndiciesWithinDistanceInAnyDirection(
      fromCellIndex,
      maxDistance
    );
  const expectedAllCellIndiciesWithinDistance =
    directionToExpectedCellIndices.reduce(
      (set1, set2) => new Set([...Array.from(set1), ...Array.from(set2)])
    );

  expect(allCellIndiciesWithinDistance).toHaveLength(
    expectedAllCellIndiciesWithinDistance.size
  );
  expect(
    allCellIndiciesWithinDistance.every((i) =>
      expectedAllCellIndiciesWithinDistance.has(i)
    )
  );
};

test("it calculates cells in directions for center cell up to distance 3", () => {
  const centerCellIndex = 0;
  const maxDistance = 3;
  const tracker = new DirectionDistanceTracker(cellsData);
  const directionToExpectedCellIndices = [
    new Set([1, 7, 19]),
    new Set([2, 9, 22]),
    new Set([3, 11, 25]),
    new Set([4, 13, 28]),
    new Set([5, 15, 31]),
    new Set([6, 17, 34]),
  ];
  for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
    const direction0CellsWithin3 =
      tracker.getCellIndiciesInDirectionWithinDistance(
        centerCellIndex,
        // @ts-ignore - direction is always less than 6
        direction,
        maxDistance
      );
    const expectedCellIndices = directionToExpectedCellIndices[direction];
    expect(direction0CellsWithin3.length).toEqual(expectedCellIndices.size);
    expect(
      direction0CellsWithin3.every((index) => expectedCellIndices.has(index))
    );
  }

  assertDistanceTrackerWorksWithoutDirection(
    tracker,
    centerCellIndex,
    maxDistance,
    directionToExpectedCellIndices
  );
});

test("it calculates cells in directions for center cell up to distance 2", () => {
  const centerCellIndex = 0;
  const maxDistance = 2;
  const tracker = new DirectionDistanceTracker(cellsData);
  const directionToExpectedCellIndices = [
    new Set([1, 7]),
    new Set([2, 9]),
    new Set([3, 11]),
    new Set([4, 13]),
    new Set([5, 15]),
    new Set([6, 17]),
  ];
  for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
    const direction0CellsWithin2 =
      tracker.getCellIndiciesInDirectionWithinDistance(
        centerCellIndex,
        // @ts-ignore - direction is always less than 6
        direction,
        maxDistance
      );
    const expectedCellIndices = directionToExpectedCellIndices[direction];
    expect(direction0CellsWithin2.length).toEqual(expectedCellIndices.size);
    expect(
      direction0CellsWithin2.every((index) => expectedCellIndices.has(index))
    );
  }

  assertDistanceTrackerWorksWithoutDirection(
    tracker,
    centerCellIndex,
    maxDistance,
    directionToExpectedCellIndices
  );
});

test("it calculates cells in directions for cell close to edge up to distance 3", () => {
  const sourceCellIndex = 13;
  const maxDistance = 3;
  const tracker = new DirectionDistanceTracker(cellsData);
  const directionToExpectedCellIndices = [
    new Set([4, 0, 1]),
    new Set([12, 11, 24]),
    new Set([27]),
    new Set([28]),
    new Set([29]),
    new Set([14, 15, 32]),
  ];
  for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
    const direction0CellsWithin3 =
      tracker.getCellIndiciesInDirectionWithinDistance(
        sourceCellIndex,
        // @ts-ignore - direction is always less than 6
        direction,
        maxDistance
      );
    const expectedCellIndices = directionToExpectedCellIndices[direction];
    expect(direction0CellsWithin3.length).toEqual(expectedCellIndices.size);
    expect(
      direction0CellsWithin3.every((index) => expectedCellIndices.has(index))
    );
  }

  assertDistanceTrackerWorksWithoutDirection(
    tracker,
    sourceCellIndex,
    maxDistance,
    directionToExpectedCellIndices
  );
});

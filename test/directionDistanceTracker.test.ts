import cellsData from "./data/CellsData";
import DirectionDistanceTracker from "../src/model/DirectionDistanceTracker";
import { NUM_DIRECTIONS } from "../src/miscConstants";

const assertDistanceTrackerWorksWithoutDirection = (
  tracker,
  fromCellIndex,
  maxDistance,
  directionToExpectedCellIndices
) => {
  const distanceToCellIndicies =
    tracker.getCellIndiciesWithinDistanceInAnyDirection(
      fromCellIndex,
      maxDistance
    );
  const expectedAllCellIndiciesWithinDistance = [[], [], []];
  directionToExpectedCellIndices.forEach((cellIndices) => {
    cellIndices.forEach((cellIndex, distanceIndex) => {
      expectedAllCellIndiciesWithinDistance[distanceIndex].push(cellIndex);
    });
  });

  expect(distanceToCellIndicies).toHaveLength(
    expectedAllCellIndiciesWithinDistance.length
  );

  for (let distanceIndex = 0; distanceIndex < 3; distanceIndex++) {
    expect(distanceToCellIndicies[distanceIndex]).toHaveLength(
      expectedAllCellIndiciesWithinDistance[distanceIndex].length
    );
    const setOfExpectedIndices = new Set(
      expectedAllCellIndiciesWithinDistance[distanceIndex]
    );
    expect(
      distanceToCellIndicies[distanceIndex].every((i) =>
        setOfExpectedIndices.has(i)
      )
    ).toBeTruthy();
  }
};

test("it calculates cells in directions for center cell up to distance 3", () => {
  const centerCellIndex = 0;
  const maxDistance = 3;
  const tracker = new DirectionDistanceTracker(cellsData);
  const directionToExpectedCellIndices = [
    [1, 7, 19],
    [2, 9, 22],
    [3, 11, 25],
    [4, 13, 28],
    [5, 15, 31],
    [6, 17, 34],
  ];
  for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
    const direction0CellsWithin3 =
      tracker.getCellIndiciesInDirectionWithinDistance(
        centerCellIndex,
        // @ts-ignore - direction is always less than 6
        direction,
        maxDistance
      );
    const expectedCellIndices = new Set(
      directionToExpectedCellIndices[direction]
    );
    expect(direction0CellsWithin3.length).toEqual(expectedCellIndices.size);
    expect(
      direction0CellsWithin3.every((index) => expectedCellIndices.has(index))
    ).toBeTruthy();
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
    [1, 7],
    [2, 9],
    [3, 11],
    [4, 13],
    [5, 15],
    [6, 17],
  ];
  for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
    const direction0CellsWithin2 =
      tracker.getCellIndiciesInDirectionWithinDistance(
        centerCellIndex,
        // @ts-ignore - direction is always less than 6
        direction,
        maxDistance
      );
    const expectedCellIndices = new Set(
      directionToExpectedCellIndices[direction]
    );
    expect(direction0CellsWithin2.length).toEqual(expectedCellIndices.size);
    expect(
      direction0CellsWithin2.every((index) => expectedCellIndices.has(index))
    ).toBeTruthy();
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
    [4, 0, 1],
    [12, 11, 24],
    [27],
    [28],
    [29],
    [14, 15, 32],
  ];
  for (let direction = 0; direction < NUM_DIRECTIONS; direction++) {
    const direction0CellsWithin3 =
      tracker.getCellIndiciesInDirectionWithinDistance(
        sourceCellIndex,
        // @ts-ignore - direction is always less than 6
        direction,
        maxDistance
      );
    const expectedCellIndices = new Set(
      directionToExpectedCellIndices[direction]
    );
    expect(direction0CellsWithin3.length).toEqual(expectedCellIndices.size);
    expect(
      direction0CellsWithin3.every((index) => expectedCellIndices.has(index))
    ).toBeTruthy();
  }

  assertDistanceTrackerWorksWithoutDirection(
    tracker,
    sourceCellIndex,
    maxDistance,
    directionToExpectedCellIndices
  );
});

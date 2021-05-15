import cellsData from "./data/CellsData";
import {
  getAllTreesThatAreBlockedByAnyShadow,
  getCellsInTreeShadow,
  getTreesThatAreBlockedByTreeShadow,
} from "../src/ShadowObserver";
import Tree, {
  SMALL_TREE_SIZE,
  LARGE_TREE_SIZE,
  MEDIUM_TREE_SIZE,
} from "../src/model/Tree";
import DirectionDistanceTracker from "../src/model/DirectionDistanceTracker";

const getMockTree = (index, size) => new Tree(index, size, true, false);

test("it gets cell in small tree shadow", () => {
  const tree = getMockTree(0, SMALL_TREE_SIZE);
  const tracker = new DirectionDistanceTracker(cellsData);
  const shadowedCells = getCellsInTreeShadow(tracker, cellsData, tree, 0);
  expect(shadowedCells).toHaveLength(SMALL_TREE_SIZE);
  expect(shadowedCells[0].index).toEqual(1);
});

test("it gets cells in large tree shadow", () => {
  const tree = getMockTree(0, LARGE_TREE_SIZE);
  const tracker = new DirectionDistanceTracker(cellsData);
  const shadowedCells = getCellsInTreeShadow(tracker, cellsData, tree, 2);
  expect(shadowedCells).toHaveLength(LARGE_TREE_SIZE);
  expect(shadowedCells[0].index).toEqual(3);
  expect(shadowedCells[1].index).toEqual(11);
  expect(shadowedCells[2].index).toEqual(25);
});

test("it gets cells in medium tree shadow off board", () => {
  const tree = getMockTree(7, LARGE_TREE_SIZE);
  const tracker = new DirectionDistanceTracker(cellsData);
  const shadowedCells = getCellsInTreeShadow(tracker, cellsData, tree, 0);
  expect(shadowedCells).toHaveLength(1);
  expect(shadowedCells[0].index).toEqual(19);
});

test("it gets smaller trees that are blocked by shadow", () => {
  const tracker = new DirectionDistanceTracker(cellsData);
  const sourceTree = new Tree(0, LARGE_TREE_SIZE, true, true);
  const allTrees = [
    sourceTree,
    getMockTree(2, SMALL_TREE_SIZE),
    getMockTree(9, MEDIUM_TREE_SIZE),
    getMockTree(22, LARGE_TREE_SIZE),
    getMockTree(1, SMALL_TREE_SIZE),
    getMockTree(3, SMALL_TREE_SIZE),
    getMockTree(4, SMALL_TREE_SIZE),
    getMockTree(5, SMALL_TREE_SIZE),
    getMockTree(6, SMALL_TREE_SIZE),
  ];

  const blockedTrees = getTreesThatAreBlockedByTreeShadow(
    tracker,
    cellsData,
    allTrees,
    sourceTree,
    1
  );
  const expectedBlockedTreeIndicies = new Set([2, 9, 22]);
  expect(blockedTrees).toHaveLength(expectedBlockedTreeIndicies.size);
  expect(
    blockedTrees
      .map((t) => t.cellIndex)
      .every((i) => expectedBlockedTreeIndicies.has(i))
  ).toBeTruthy();
});

test("it larger trees are not blocked by shadow", () => {
  const tracker = new DirectionDistanceTracker(cellsData);
  const sourceTree = new Tree(0, SMALL_TREE_SIZE, true, true);
  const allTrees = [
    sourceTree,
    getMockTree(1, LARGE_TREE_SIZE),
    getMockTree(7, MEDIUM_TREE_SIZE),
    getMockTree(19, MEDIUM_TREE_SIZE),
  ];

  const blockedTrees = getTreesThatAreBlockedByTreeShadow(
    tracker,
    cellsData,
    allTrees,
    sourceTree,
    1
  );
  expect(blockedTrees).toHaveLength(0);
});

test("it gets all trees that are blocked by any shadow", () => {
  const allTrees = [
    getMockTree(0, LARGE_TREE_SIZE),
    getMockTree(19, LARGE_TREE_SIZE),
    getMockTree(3, SMALL_TREE_SIZE),
    getMockTree(2, MEDIUM_TREE_SIZE),
    getMockTree(8, MEDIUM_TREE_SIZE),
    getMockTree(4, MEDIUM_TREE_SIZE),
    getMockTree(30, SMALL_TREE_SIZE),
  ];
  const expectedBlockedTreeIndices = new Set([19, 8]);
  const tracker = new DirectionDistanceTracker(cellsData);
  const blockedTrees = getAllTreesThatAreBlockedByAnyShadow(
    tracker,
    cellsData,
    allTrees,
    0
  );
  expect(blockedTrees).toHaveLength(expectedBlockedTreeIndices.size);
  expect(
    blockedTrees
      .map((t) => t.cellIndex)
      .every((i) => expectedBlockedTreeIndices.has(i))
  );
});

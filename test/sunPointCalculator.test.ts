import calculateSunPointsGainedForDay from "../src/sunPointCalculator";
import Tree, { LARGE_TREE_SIZE, MEDIUM_TREE_SIZE, SMALL_TREE_SIZE } from "../src/model/Tree";
import cellsData from "./data/CellsData";
import Player from "../src/model/Player";

const getMockTree = (index, size, isMine = true) => new Tree(index, size, isMine, false);

test('it calculates sun points for no trees', () => {
    const allTrees = [];
    const myPlayer = new Player(0, 0, [], false);
    const sunPointsGained = calculateSunPointsGainedForDay(cellsData, myPlayer, allTrees, 0);
    expect(sunPointsGained).toEqual(0);
});

test('it calculates sun points for some trees', () => {
    const allTrees = [
        getMockTree(0, LARGE_TREE_SIZE),
        getMockTree(19, LARGE_TREE_SIZE, false), // blocked
        getMockTree(3, SMALL_TREE_SIZE, false),
        getMockTree(2, MEDIUM_TREE_SIZE, false),
        getMockTree(8, MEDIUM_TREE_SIZE), // blocked
        getMockTree(4, MEDIUM_TREE_SIZE),
        getMockTree(30, SMALL_TREE_SIZE),
    ];

    const myPlayer = new Player(0, 0, allTrees.filter(t => t.isMine), false);

    const sunPointsGained = calculateSunPointsGainedForDay(cellsData, myPlayer, allTrees, 0);
    expect(sunPointsGained).toEqual(6);
});

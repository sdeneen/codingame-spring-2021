import Game from "../src/model/Game";
import Cell from "../src/model/Cell";
import Player from "../src/model/Player";
import Tree from "../src/model/Tree";
import determineGameStateAfterGrowAction from "../src/gameStateManager";

const createInitialGame = () =>
  new Game(
    1,
    2,
    [new Cell(0, 1, [1, 2, 3, 4, 5, 6])],
    new Player(8, 2, [new Tree(1, 2, true, false)], false),
    new Player(7, 2, [new Tree(6, 2, false, false)], false)
  );

test("it determines game state after GROW action", () => {
  const game = createInitialGame();

  const newState = determineGameStateAfterGrowAction(game, 1);
  expect(newState.myPlayer.sunPoints).toEqual(1);
  expect(newState.myPlayer.cellIndexToTree[1].size).toEqual(3);
  expect(newState.myPlayer.cellIndexToTree[1].isDormant).toEqual(true);
  expect(newState.day).toEqual(game.day);
  expect(newState.nutrients).toEqual(game.nutrients);
  expect(newState.cells[0].equals(game.cells[0])).toBeTruthy();
  expect(newState.opponentPlayer.equals(game.opponentPlayer)).toBeTruthy();

  // No changes to original state
  expect(game.equals(createInitialGame())).toBeTruthy();
});

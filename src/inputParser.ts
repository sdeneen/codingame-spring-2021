import Cell from "./model/Cell";
import Game from "./model/Game";
import Player from "./model/Player";
import Tree from "./model/Tree";

// This is a global provided by Codingame
declare const readline: () => string;

const parseInitializationInput = (): Cell[] => {
  const cells: Cell[] = [];
  const numberOfCells = parseInt(readline()); // 37
  for (let i = 0; i < numberOfCells; i++) {
    const inputs = readline().split(" ");
    const index = parseInt(inputs[0]); // 0 is the center cell, the next cells spiral outwards
    const richness = parseInt(inputs[1]); // 0 if the cell is unusable, 1-3 for usable cells

    cells.push(
      new Cell(index, richness, [
        parseInt(inputs[2]),
        parseInt(inputs[3]),
        parseInt(inputs[4]),
        parseInt(inputs[5]),
        parseInt(inputs[6]),
        parseInt(inputs[7]),
      ])
    );
  }

  return cells;
};

const parseTurnInput = (cells: Cell[]): Game => {
  const day = parseInt(readline()); // the game lasts 24 days: 0-23
  const nutrients = parseInt(readline()); // the base score you gain from the next COMPLETE action
  let inputs = readline().split(" ");
  const sun = parseInt(inputs[0]); // your sun points
  const score = parseInt(inputs[1]); // your current score
  inputs = readline().split(" ");
  const oppSun = parseInt(inputs[0]); // opponent's sun points
  const oppScore = parseInt(inputs[1]); // opponent's score
  const oppIsWaiting = inputs[2] !== "0"; // whether your opponent is asleep until the next day
  const numberOfTrees = parseInt(readline()); // the current amount of trees
  const myTrees = [];
  const opponentTrees = [];
  for (let i = 0; i < numberOfTrees; i++) {
    inputs = readline().split(" ");
    const cellIndex = parseInt(inputs[0]); // location of this tree
    const size = parseInt(inputs[1]); // size of this tree: 0-3
    const isMine = inputs[2] !== "0"; // 1 if this is your tree
    const isDormant = inputs[3] !== "0"; // 1 if this tree is dormant
    const tree = new Tree(cellIndex, size, isMine, isDormant);
    cells[cellIndex].setOccupied();
    if (isMine) {
      myTrees.push(tree);
    } else {
      opponentTrees.push(tree);
    }
  }

  const myPlayer = new Player(sun, score, myTrees, false);
  const opponentPlayer = new Player(
    oppSun,
    oppScore,
    opponentTrees,
    oppIsWaiting
  );
  const numberOfPossibleActions = parseInt(readline()); // all legal actions
  for (let i = 0; i < numberOfPossibleActions; i++) {
    readline();
  }

  return new Game(day, nutrients, cells, myPlayer, opponentPlayer);
};

export { parseInitializationInput, parseTurnInput };

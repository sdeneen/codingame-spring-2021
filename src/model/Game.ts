import deepCopy from "../utils/deepCopy";
import { coalesce } from "../utils/nullUtils";
import Player from "./Player";
import Cell from "./Cell";
import Tree from "./Tree";

interface GameFields {
  day: number;
  nutrients: number;
  cells: Cell[];
  myPlayer: Player;
  opponentPlayer: Player;
}

export default class Game {
  day: number;
  nutrients: number;
  cells: Cell[];
  myPlayer: Player;
  opponentPlayer: Player;

  constructor(day, nutrients, cells, myPlayer, opponentPlayer) {
    this.day = day;
    this.nutrients = nutrients;
    this.cells = cells;
    this.myPlayer = myPlayer;
    this.opponentPlayer = opponentPlayer;
  }

  /**
   * Get all trees on the board, regardless of which player owns them
   */
  getAllTrees = (): Tree[] => [
    ...this.myPlayer.getTrees(),
    ...this.opponentPlayer.getTrees(),
  ];

  /**
   * Get the tree at the given cell index, if any exists
   */
  getTree = (cellIndex: number): Tree | null =>
    this.myPlayer.cellIndexToTree[cellIndex] ||
    this.opponentPlayer.cellIndexToTree[cellIndex] ||
    null;

  /**
   * Get a deep copy of this object, replacing any provided fields
   */
  getModifiedDeepCopy = ({
    day,
    nutrients,
    cells,
    myPlayer,
    opponentPlayer,
  }: Partial<GameFields>): Game => {
    return new Game(
      coalesce(day, this.day),
      coalesce(nutrients, this.nutrients),
      coalesce(cells, deepCopy(this.cells)),
      coalesce(myPlayer, deepCopy(this.myPlayer)),
      coalesce(opponentPlayer, deepCopy(this.opponentPlayer))
    );
  };

  toString = () => JSON.stringify(this);

  equals = (other: Game): boolean =>
    !!other &&
    this.day === other.day &&
    this.nutrients === other.nutrients &&
    this.cells.length === other.cells.length &&
    this.cells.every((value, index) => value.equals(other.cells[index])) &&
    this.myPlayer.equals(other.myPlayer) &&
    this.opponentPlayer.equals(other.opponentPlayer);
}

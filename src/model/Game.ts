import Action from './Action';
import Player from './Player'
import Cell from './Cell';

export default class Game {
    day: number;
    nutrients: number;
    cells: Cell[];
    possibleActions: Action[];
    myPlayer: Player;
    opponentPlayer: Player;

    constructor(
        day,
        nutrients,
        cells,
        possibleActions,
        myPlayer,
        opponentPlayer,
    ) {
        this.day = day;
        this.nutrients = nutrients;
        this.cells = cells;
        this.possibleActions = possibleActions;
        this.myPlayer = myPlayer;
        this.opponentPlayer = opponentPlayer;
    }
}
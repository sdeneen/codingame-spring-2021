import { parseInitializationInput, parseTurnInput } from './inputParser';
import getActionForSunPointSaverStrategy from "./strategy/sunPointSaverStrategy";
import { getActionForCompleteTreesStrategy } from "./strategy/completeTreesStrategy";
import { NUM_TURNS } from "./miscConstants";
import { getTrashTalk } from "./utils/trashTalker";
import Action from './model/Action';
import Cell from './model/Cell';
import Game from './model/Game';

const cells: Cell[] = parseInitializationInput();

while (true) {
    const game: Game = parseTurnInput(cells);
    let action: Action;
    if (game.day / NUM_TURNS < 0.75) {
        action = getActionForSunPointSaverStrategy(game);
    } else {
        action = getActionForCompleteTreesStrategy(game);
    }

    console.log(`${action} ${getTrashTalk()}`);
}

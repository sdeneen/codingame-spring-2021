import { parseInitializationInput, parseTurnInput } from './inputParser';
import getActionForSunPointSaverStrategy from "./strategy/sunPointSaverStrategy";
import getActionForCompleteTreesStrategy from "./strategy/completeTreesStrategy";
import { NUM_TURNS } from "./miscConstants";
import { getTrashTalk } from "./utils/trashTalker";

const cells = parseInitializationInput();

while (true) {
    const game = parseTurnInput(cells);
    let action;
    if (game.day / NUM_TURNS >= 0.75) {
        action = getActionForCompleteTreesStrategy(game);
    } else {
        action = getActionForSunPointSaverStrategy(game);
    }

    console.log(`${action} ${getTrashTalk()}`);
}

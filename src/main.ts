import { parseInitializationInput, parseTurnInput } from "./inputParser";
import getActionForSunPointSaverStrategy from "./strategy/sunPointSaverStrategy";
import { getActionForCompleteTreesStrategy } from "./strategy/completeTreesStrategy";
import { NUM_DAYS } from "./miscConstants";
import { getTrashTalk } from "./utils/trashTalker";
import Action from "./model/Action";
import Cell from "./model/Cell";
import Game from "./model/Game";

const cells: Cell[] = parseInitializationInput();
let dayTracker = 0;
let lateGameActionCount = 0;

while (true) {
  const game: Game = parseTurnInput(cells);
  if (dayTracker !== game.day) {
    dayTracker = game.day;
    lateGameActionCount = 0;
  }
  let action: Action;
  if (game.day / NUM_DAYS < 0.75) {
    action = getActionForSunPointSaverStrategy(game);
  } else {
    if (lateGameActionCount > 1) {
      action = new Action("WAIT");
    } else {
      console.error(`taking late game action - ${lateGameActionCount}`);
      action = getActionForCompleteTreesStrategy(game);
      lateGameActionCount++;
    }
  }
  console.log(`${action} ${getTrashTalk()}`);
}

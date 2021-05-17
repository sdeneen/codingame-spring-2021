import { parseInitializationInput, parseTurnInput } from "./inputParser";
import getActionForSunPointSaverStrategy from "./strategy/sunPointSaverStrategy";
import { getActionForCompleteTreesStrategy } from "./strategy/completeTreesStrategy";
import { getTrashTalk } from "./utils/trashTalker";
import Action from "./model/Action";
import Cell from "./model/Cell";
import Game from "./model/Game";
import DirectionDistanceTracker from "./model/DirectionDistanceTracker";
import StaticCellData from "./model/StaticCellData";

const cells: Cell[] = parseInitializationInput();
const sameDirectionDistanceTracker = new DirectionDistanceTracker(cells);
const staticCellData = new StaticCellData(sameDirectionDistanceTracker);

let dayTracker = 0;
let lateGameActionCount = 0;

while (true) {
  const game: Game = parseTurnInput(cells);
  if (dayTracker !== game.day) {
    dayTracker = game.day;
    lateGameActionCount = 0;
  }
  let action: Action;
  if (game.day < 17) {
    action = getActionForSunPointSaverStrategy(game, staticCellData);
  } else {
    const numLateGameActionsAllowedThisDay = game.day % 2 === 0 ? 2 : 1;
    if (lateGameActionCount >= numLateGameActionsAllowedThisDay) {
      action = new Action("WAIT");
    } else {
      console.error(`taking late game action - ${lateGameActionCount}`);
      action = getActionForCompleteTreesStrategy(game);
      lateGameActionCount++;
    }
  }
  console.log(`${action} ${getTrashTalk()}`);
}

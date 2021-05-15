import { parseInitializationInput, parseTurnInput } from "./inputParser";
import getActionForSunPointSaverStrategy from "./strategy/sunPointSaverStrategy";
import getActionForLateGameStrategy from "./strategy/lateGameStrategy";
import { NUM_DAYS, MIN_NUM_DAYS_IN_TREE_LIFECYCLE } from "./miscConstants";
import { getTrashTalk } from "./utils/trashTalker";
import Action from "./model/Action";
import Cell from "./model/Cell";
import Game from "./model/Game";

const cells: Cell[] = parseInitializationInput();

while (true) {
  const game: Game = parseTurnInput(cells);
  let action: Action;
  if (game.day < NUM_DAYS - MIN_NUM_DAYS_IN_TREE_LIFECYCLE) {
    action = getActionForSunPointSaverStrategy(game);
  } else {
    action = getActionForLateGameStrategy(game);
  }

  console.log(`${action} ${getTrashTalk()}`);
}

import { parseInitializationInput, parseTurnInput } from './inputParser';
import woodQuickStrat from "./woodQuickStrat";

const cells = parseInitializationInput();

while (true) {
    const game = parseTurnInput(cells);
    woodQuickStrat(game);
}

import { parseInitializationInput, parseTurnInput } from './inputParser';

const cells = parseInitializationInput();

while (true) {
    const turnInput = parseTurnInput();

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');


    // GROW cellIdx | SEED sourceIdx targetIdx | COMPLETE cellIdx | WAIT <message>
    console.log('WAIT');
}


const playHawtWoodStrategy = () => {
    player.getTrees().forEach(tree => {
        if (cells[tree.cellIdx].richness === 3) {
            console.log(`COMPLETE ${tree.cellIdx}`)
            return;
        }
    });
}
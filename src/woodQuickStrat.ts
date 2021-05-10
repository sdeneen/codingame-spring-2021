import Game from "./model/Game";
import calculateTreeActionCost from "./cost/ActionCostCalculator";
import Action from "./model/Action";
import { getTrashTalk } from "./model/TrashTalker";

const woodQuickStrat = (game: Game) => {
    const maxTreesToConsider = 3;
    const { myPlayer: { sunPoints, trees }, cells } = game;
    trees.sort((tree1, tree2) => {
        const richness1 = cells[tree1.cellIndex].richness;
        const richness2 = cells[tree2.cellIndex].richness;
        // Prioritize high richness first
        if (richness1 !== richness2) {
            return richness2 - richness1;
        }

        // Then prioritize large tree size
        return tree2.size - tree1.size;
    });

    const numTreesToConsider = Math.min(trees.length, maxTreesToConsider);
    for (let i = 0; i < numTreesToConsider; i++) {
        const curTree = trees[i];
        const actionForTree = curTree.getNextAction();
        if (actionForTree !== null) {
            const cost = calculateTreeActionCost(trees, actionForTree, curTree);
            if (sunPoints >= cost) {
                console.log(`${actionForTree.toString()} ${getTrashTalk()}`);
                return;
            }
        }
    }

    console.log(new Action("WAIT").toString());
}

export default woodQuickStrat;

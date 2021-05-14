import Game from "./model/Game";
import deepCopy from "./utils/deepCopy";
import calculateTreeActionCost from "./cost/ActionCostCalculator";

/**
 * Given a game state and a target cell index to perform the GROW action on, return what the game state would be
 * after that action is taken.
 *
 * This could be augmented later to handle any action, not just grow actions.
 */
const determineGameStateAfterGrowAction = (
  currentState: Game,
  targetCellIndex: number
): Game => {
  const { myPlayer, opponentPlayer } = currentState;
  const tree = currentState.getTree(targetCellIndex);
  if (tree === null) {
    console.error(
      `Requested a GROW action on cell index ${targetCellIndex} which doesn't have a tree`
    );
    return currentState;
  }

  const player = tree.isMine ? myPlayer : opponentPlayer;
  const { sunPoints, cellIndexToTree } = player;
  const sunPointCost = calculateTreeActionCost(player.getTrees(), "GROW", tree);
  if (sunPoints < sunPointCost) {
    console.error(
      `Requested a GROW action on cell index ${targetCellIndex} which would cost ${sunPointCost} sun points but the player only has ${player.sunPoints}`
    );
    return currentState;
  }

  const grownTree = tree.getTreeAfterGrow();

  // We have our new tree, now we need a copy of the game state with the new tree and the sunPoint cost deducted
  // from the relevant player

  const newCellIndexToTree = deepCopy(cellIndexToTree);
  newCellIndexToTree[grownTree.cellIndex] = grownTree;
  const newPlayer = player.getModifiedDeepCopy({
    sunPoints: sunPoints - sunPointCost,
    cellIndexToTree: newCellIndexToTree,
  });

  const updatedGameFields = tree.isMine
    ? {
        myPlayer: newPlayer,
      }
    : {
        opponentPlayer: newPlayer,
      };

  return currentState.getModifiedDeepCopy(updatedGameFields);
};

export default determineGameStateAfterGrowAction;

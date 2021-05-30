import Game from "./model/Game";
import deepCopy from "./utils/deepCopy";
import calculateTreeActionCost from "./cost/ActionCostCalculator";
import { LARGEST_TREE_SIZE } from "./model/Tree";
import calculateScoreForCompleteAction from "./scoreCalculator";
import Action from "./model/Action";

const determineGameStateAfterGrowOrCompleteAction = (
  currentState: Game,
  action: Action
) => {
  const { targetCellIdx, type } = action;
  switch (type) {
    case "COMPLETE":
      return determineGameStateAfterCompleteAction(currentState, targetCellIdx);
    case "GROW":
      return determineGameStateAfterGrowAction(currentState, targetCellIdx);
    case "WAIT":
      return currentState;
    default:
      console.error(
        "ERROR: tried to determine game state after a SEED action, which isn't supported"
      );
      return currentState;
  }
};
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
  const { myPlayer, opponentPlayer, cells } = currentState;
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

  const previousCell = cells[tree.cellIndex];
  const newCell = previousCell.getModifiedDeepCopy({
    tree: grownTree,
  });
  const newCellsList = deepCopy(cells);
  newCellsList[tree.cellIndex] = newCell;

  const updatedGameFields = tree.isMine
    ? {
        myPlayer: newPlayer,
        cells: newCellsList,
      }
    : {
        opponentPlayer: newPlayer,
        cells: newCellsList,
      };

  return currentState.getModifiedDeepCopy(updatedGameFields);
};

const determineGameStateAfterCompleteAction = (
  currentState: Game,
  targetCellIndex: number
): Game => {
  const { myPlayer, opponentPlayer, nutrients, cells } = currentState;
  const tree = currentState.getTree(targetCellIndex);
  if (tree === null || tree.size !== LARGEST_TREE_SIZE) {
    console.error(
      `ERROR: Requested a COMPLETE action on cell index ${targetCellIndex} which doesn't have a tree of the largest tree size`
    );
    return currentState;
  }

  const cellForTree = cells[tree.cellIndex];
  const player = tree.isMine ? myPlayer : opponentPlayer;
  const { sunPoints, cellIndexToTree, score } = player;
  const sunPointCost = calculateTreeActionCost(
    player.getTrees(),
    "COMPLETE",
    tree
  );
  const newCellIndexToTree = deepCopy(cellIndexToTree);
  delete newCellIndexToTree[tree.cellIndex];
  const scoreForCompletingTree = calculateScoreForCompleteAction(
    nutrients,
    cellForTree.richness
  );
  const newPlayer = player.getModifiedDeepCopy({
    sunPoints: sunPoints - sunPointCost,
    score: score + scoreForCompletingTree,
    cellIndexToTree: newCellIndexToTree,
  });

  const newCell = cellForTree.getModifiedDeepCopy({
    tree: null,
  });
  const newCellsList = deepCopy(cells);
  newCellsList[tree.cellIndex] = newCell;
  const newNutrients = nutrients - 1;

  const updatedGameFields = tree.isMine
    ? {
        myPlayer: newPlayer,
        cells: newCellsList,
        nutrients: newNutrients,
      }
    : {
        opponentPlayer: newPlayer,
        cells: newCellsList,
        nutrients: newNutrients,
      };

  return currentState.getModifiedDeepCopy(updatedGameFields);
};

export default determineGameStateAfterGrowAction;
export {
  determineGameStateAfterCompleteAction,
  determineGameStateAfterGrowOrCompleteAction,
};

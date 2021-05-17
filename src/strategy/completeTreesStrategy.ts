import calculateTreeActionCost, {
  COST_TO_COMPLETE_TREE,
} from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Game from "../model/Game";
import { NUM_DAYS } from "../miscConstants";
import Tree, {
  LARGEST_TREE_SIZE,
  LARGE_TREE_SIZE,
  MEDIUM_TREE_SIZE,
} from "../model/Tree";
import { getTreesThatCastSpookyShadowOnTree } from "../shadowObserver";

/**
 * Strategy that just tries to complete trees as soon as possible, good for late game.
 */
const getActionForCompleteTreesStrategy = (game: Game): Action | null => {
  const maxTreesToConsider = 3;
  const { myPlayer, cells } = game;
  const { sunPoints } = myPlayer;
  const allMyTrees = myPlayer.getTrees();
  const daysRemainingIncludingCurDay = NUM_DAYS - game.day;
  const treesToConsider = allMyTrees.filter(
    (tree) =>
      !tree.isDormant &&
      daysRemainingIncludingCurDay >= tree.getMinDaysToComplete()
  );

  treesToConsider.sort((tree1, tree2) => {
    // Prioritize largest size first (closest to completion)
    if (tree2.size !== tree1.size) {
      return tree2.size - tree1.size;
    }

    // TODO this could also prioritize based on how many sun points we expect to receive from this tree in future turn(s)
    const spookedAndCompletable1: boolean =
      getTreesThatCastSpookyShadowOnTree(cells, game.day + 1, tree1).length >
        0 && tree1.size === LARGEST_TREE_SIZE;
    const spookedAndCompletable2: boolean =
      getTreesThatCastSpookyShadowOnTree(cells, game.day + 1, tree2).length >
        0 && tree2.size === LARGEST_TREE_SIZE;

    if (spookedAndCompletable1 === spookedAndCompletable2) {
      // Then prioritize richness
      const richness1 = cells[tree1.cellIndex].richness;
      const richness2 = cells[tree2.cellIndex].richness;
      return richness2 - richness1;
    }

    return spookedAndCompletable1 ? -1 : 1;
  });

  const numTreesToConsider = Math.min(
    treesToConsider.length,
    maxTreesToConsider
  );
  for (let i = 0; i < numTreesToConsider; i++) {
    const curTree = treesToConsider[i];
    const actionForTree = curTree.getNextAction();
    if (actionForTree !== null) {
      const cost = calculateTreeActionCost(
        allMyTrees,
        actionForTree.type,
        curTree
      );
      if (sunPoints >= cost) {
        return actionForTree;
      }
    }
  }

  return new Action("WAIT");
};

/**
 * Strategy that finds trees that are size 2 or 3 and
 * would not garner sun points for the next N days.
 *
 * Note: this is a prediction since the oppo can grow a tree during the next day that causes
 *       future days to be spooked
 */
const getGrowOrCompleteActionForSpookedTrees = (game: Game): Action | null => {
  const wastedTrees = getAllWastedTrees(game, 2);
  const affordableWastedTrees = wastedTrees.filter(
    (tree) =>
      calculateTreeActionCost(
        game.myPlayer.getTrees(),
        tree.getNextAction().type,
        tree
      ) <= game.myPlayer.sunPoints
  );

  if (affordableWastedTrees.length !== 0) {
    return affordableWastedTrees
      .reduce((t1, t2) =>
        game.cells[t1.cellIndex].richness > game.cells[t2.cellIndex].richness
          ? t1
          : t2
      )
      .getNextAction();
  }

  return null;
};

const getSunPointsGainedForTrees = (trees: Tree[]): number => {
  if (trees.length === 0) {
    return 0;
  }

  return trees.reduce((sum, tree) => sum + tree.getSunPointGainPerDay(), 0);
};

/**
 * Conceptually the reverse of {getGrowOrCompleteActionForSpookedTrees}. Finds our large trees that will stop
 * our other trees from getting sun next turn. Picks one to complete so that our blocked tree gets sun!
 */
const getCompleteActionForTreeThatBlocksOurOtherTrees = (
  game: Game
): Action | null => {
  const { myPlayer, cells, day } = game;
  if (myPlayer.sunPoints < COST_TO_COMPLETE_TREE) {
    return null;
  }

  const myTrees = myPlayer.getTrees();
  const sourceTreeIndexToBlockedTrees = {};
  // Look at blockages over the next two days
  for (let curDay = day + 1; curDay <= day + 2; curDay++) {
    myTrees.forEach((tree) => {
      const treesCastingSpookyShadowOnTree = getTreesThatCastSpookyShadowOnTree(
        cells,
        curDay,
        tree
      );

      if (treesCastingSpookyShadowOnTree.length === 1) {
        const sourceTree = treesCastingSpookyShadowOnTree[0];
        if (sourceTree.isMine && sourceTree.size === LARGEST_TREE_SIZE) {
          const blockedTrees =
            sourceTreeIndexToBlockedTrees[sourceTree.cellIndex] || [];
          blockedTrees.push(tree);
          sourceTreeIndexToBlockedTrees[sourceTree.cellIndex] = blockedTrees;
        }
      }
    });
  }

  // Only look at non-dormant trees that will cause us to lose at least N sun points over the next two turns
  const cellIndiciesToConsiderCompleting = Object.keys(
    sourceTreeIndexToBlockedTrees
  ).filter(
    (cellIndex) =>
      !cells[cellIndex].tree.isDormant &&
      getSunPointsGainedForTrees(sourceTreeIndexToBlockedTrees[cellIndex]) > 3
  );

  if (cellIndiciesToConsiderCompleting.length === 0) {
    return null;
  }

  const chosenCellIndexStr = cellIndiciesToConsiderCompleting.reduce(
    (cellIndex1, cellIndex2) => {
      const sunPointsBlocked1 = getSunPointsGainedForTrees(
        sourceTreeIndexToBlockedTrees[cellIndex1]
      );
      const sunPointsBlocked2 = getSunPointsGainedForTrees(
        sourceTreeIndexToBlockedTrees[cellIndex2]
      );
      if (sunPointsBlocked1 !== sunPointsBlocked2) {
        return sunPointsBlocked1 > sunPointsBlocked2 ? cellIndex1 : cellIndex2;
      }

      const richness1 = cells[cellIndex1].richness;
      const richness2 = cells[cellIndex2].richness;
      if (richness1 >= richness2) {
        return cellIndex1;
      }
    }
  );

  return new Action("COMPLETE", null, parseInt(chosenCellIndexStr, 10));
};

const getAllWastedTrees = (game: Game, wastedDays: number): Tree[] => {
  const treesToConsider: Tree[] = getTreesToConsider(game.myPlayer.getTrees());
  let wastedTrees: Tree[] = [];

  for (let index = 0; index < treesToConsider.length; index++) {
    const tree: Tree = treesToConsider[index];
    let areAllDaysWasted: boolean = true;

    for (let i = 1; i <= wastedDays; i++) {
      const treesCastingSpookyShadows = getTreesThatCastSpookyShadowOnTree(
        game.cells,
        game.day + i,
        tree
      );
      if (treesCastingSpookyShadows.length === 0) {
        // No need to continue checking since
        // at least one day of the N days will get sun points
        areAllDaysWasted = false;
        break;
      }
    }

    if (areAllDaysWasted) {
      wastedTrees.push(tree);
    }
  }

  return wastedTrees;
};

const getTreesToConsider = (trees: Tree[]): Tree[] => {
  return trees.filter(
    (tree) => tree.size === LARGE_TREE_SIZE && !tree.isDormant
  );
};

export {
  getActionForCompleteTreesStrategy,
  getGrowOrCompleteActionForSpookedTrees,
  getCompleteActionForTreeThatBlocksOurOtherTrees,
};

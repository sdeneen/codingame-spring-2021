import calculateTreeActionCost, {
  COST_TO_COMPLETE_TREE,
} from "../cost/ActionCostCalculator";
import Action from "../model/Action";
import Game from "../model/Game";
import Tree, {
  MEDIUM_TREE_SIZE,
  LARGE_TREE_SIZE,
  LARGEST_TREE_SIZE,
} from "../model/Tree";
import { getTreesThatCastSpookyShadowOnTree } from "../shadowObserver";
import { NUM_DAYS } from "../miscConstants";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import deepCopy from "../utils/deepCopy";

/**
 * Strategy that finds trees that would not garner sun points for the next N days, and that are somewhat close to
 * being able to be completed (medium size and up)
 *
 * Note: this is a prediction since the oppo can grow a tree during the next day that causes
 *       future days to be spooked
 */
const getActionToGetCloserToCompletingSpookedTrees = (
  game: Game,
  numSpookyTurnsRequired: number
): Action | null => {
  const wastedTrees = getAllWastedTrees(game, numSpookyTurnsRequired);
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
    (tree) =>
      (tree.size === LARGE_TREE_SIZE || tree.size === MEDIUM_TREE_SIZE) &&
      !tree.isDormant
  );
};

const getCompletableTrees = (trees: Tree[]): Tree[] => {
  return trees.filter(
    (tree) => tree.size === LARGE_TREE_SIZE && !tree.isDormant
  );
};

/**
 * Makes the assumption that other trees won't change in future turns, which is straight up incorrect but this
 * should provide an estimate at least. We can improve as needed later
 */
const estimateCostToGrowAndCompleteTree = (
  cellIndexToTree: Record<number, Tree>,
  tree: Tree
) => {
  let curTreeState = tree.getDeepCopy();
  let cellIndexToTreeState = deepCopy(cellIndexToTree);
  let sunPointCost = 0;
  while (curTreeState.size < LARGEST_TREE_SIZE) {
    sunPointCost += calculateTreeActionCost(
      Object.values(cellIndexToTreeState),
      "GROW",
      curTreeState
    );
    curTreeState = curTreeState.getModifiedDeepCopy({
      size: curTreeState.size + 1,
    });
    cellIndexToTreeState[curTreeState.cellIndex] = curTreeState;
  }

  return sunPointCost + COST_TO_COMPLETE_TREE;
};

/**
 * This method makes some assumptions about future turns that won't be accurate but hopefully are close enough
 * to perform well. See the comments in this method and on `estimateCostToGrowAndCompleteTree`
 *
 * It takes into account sun point (estimated) and number of days requirements for tree completion.
 */
const estimateWhichTreesWeCanCompleteByEndOfGame = (game: Game): Tree[] => {
  const { cells, day, myPlayer } = game;
  const numDaysRemainingExcludingCurDay = NUM_DAYS - day - 1;
  const numDaysRemainingIncludingCurDay = numDaysRemainingExcludingCurDay + 1;
  const allTrees = game.getAllTrees();
  // Assume we'll gain on average the same number of sun points per day remaining as we did today
  // This could be optimized further
  const sunPointsGainedToday = calculateSunPointsGainedForDay(
    cells,
    myPlayer,
    allTrees,
    day
  );
  const sunPointsGainedInRemainingDays =
    numDaysRemainingExcludingCurDay * sunPointsGainedToday;
  const totalSunPoints = myPlayer.sunPoints + sunPointsGainedInRemainingDays;

  // Make sure to only look at trees that can be completed in the number of days remaining in the game
  const myEligibleTrees = myPlayer
    .getTrees()
    .filter(
      (tree) => numDaysRemainingIncludingCurDay >= tree.getMinDaysToComplete()
    );

  // Prioritize easiest/closest completion (quantity) first, then richness (quality)
  myEligibleTrees.sort((tree1, tree2) => {
    if (tree2.size !== tree1.size) {
      return tree2.size - tree1.size;
    }

    const richness1 = cells[tree1.cellIndex].richness;
    const richness2 = cells[tree2.cellIndex].richness;
    return richness2 - richness1;
  });

  // Find the ones we can realistically complete given how many sun points we estimate that we will have to work with
  const treesToComplete = [];
  let sunPointsLeftToSpend = totalSunPoints;
  for (let i = 0; i < myEligibleTrees.length; i++) {
    const tree = myEligibleTrees[i];
    const sunPointsToComplete = estimateCostToGrowAndCompleteTree(
      myPlayer.cellIndexToTree,
      tree
    );
    if (sunPointsToComplete > sunPointsLeftToSpend) {
      break;
    }
    sunPointsLeftToSpend -= sunPointsToComplete;
    treesToComplete.push(tree);
  }

  return treesToComplete;
};

export {
  getActionToGetCloserToCompletingSpookedTrees,
  getCompletableTrees,
  estimateWhichTreesWeCanCompleteByEndOfGame,
};

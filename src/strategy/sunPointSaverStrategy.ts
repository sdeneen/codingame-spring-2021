import Game from "../model/Game";
import calculateTreeActionCost from "../cost/ActionCostCalculator";
import Action, { ACTION_TYPES } from "../model/Action";
import Tree, {
  ACTIONS_IN_TREE_LIFECYCLE,
  LARGE_TREE_SIZE,
  MEDIUM_TREE_SIZE,
  SEED_TREE_SIZE,
  SMALL_TREE_SIZE,
} from "../model/Tree";
import { determineGameStateAfterGrowOrCompleteAction } from "../gameStateManager";
import calculateSunPointsGainedForDay from "../sunPointCalculator";
import { getBestSeedAction } from "./seedingStrategy";
import { HIGH_RICHNESS } from "../model/Cell";
import StaticCellData from "../model/StaticCellData";
import { NUM_DAYS } from "../miscConstants";
import calculateScoreForCompleteAction from "../scoreCalculator";

const getActionForSunPointSaverStrategy = (
  game: Game,
  staticCellData: StaticCellData
): Action => {
  // Looks to see if any of our size 3 trees will block our other trees and tries to complete them
  // TODO improvement: if we're able to GROW the other tree out of the blockage instead, then don't bother COMPLETEing and let the grow action part of the algo handle it
  // const completeActionToUnblock =
  //   getCompleteActionForTreeThatBlocksOurOtherTrees(game);
  // if (completeActionToUnblock !== null) {
  //   console.error("===== Completing a tree to unblock our other tree(s)");
  //   return completeActionToUnblock;
  // }
  const [bestGrowOrCompleteAction, sunPointGainExcludingCost] =
    getGrowOrCompleteActionWithBestSunPointPayoff(game, staticCellData);
  if (sunPointGainExcludingCost >= 2) {
    if (bestGrowOrCompleteAction.type === "COMPLETE") {
      console.error("==== Completing a tree early for the pointssss");
    }
    return bestGrowOrCompleteAction;
  }

  // TODO consider removing or changing to just COMPLETE actions
  // const bestSpookyAvoidanceAction =
  //   getGrowOrCompleteActionForSpookedTrees(game);
  //
  // if (bestSpookyAvoidanceAction !== null) {
  //   console.error("===== Trying to grow/complete spooked trees early!");
  //   return bestSpookyAvoidanceAction;
  // }
  const daysRemainingIncludingCurDay = NUM_DAYS - game.day;
  const canCompleteSeed =
    daysRemainingIncludingCurDay >= ACTIONS_IN_TREE_LIFECYCLE;
  const freeSeedAction = canCompleteSeed
    ? getBestSeedAction(staticCellData, game)
    : null;

  if (
    freeSeedAction !== null &&
    bestGrowOrCompleteAction !== null &&
    freeSeedAction?.sourceCellIdx === bestGrowOrCompleteAction?.sourceCellIdx
  ) {
    if (game.cells[freeSeedAction.targetCellIdx].richness === HIGH_RICHNESS) {
      return freeSeedAction;
    }
    if (bestGrowOrCompleteAction.type === "COMPLETE") {
      console.error("==== Completing a tree early for the pointssss");
    }
    return bestGrowOrCompleteAction;
  }

  if (freeSeedAction !== null) {
    return freeSeedAction;
  }
  if (bestGrowOrCompleteAction !== null) {
    if (bestGrowOrCompleteAction.type === "COMPLETE") {
      console.error("==== Completing a tree early for the pointssss");
    }
    return bestGrowOrCompleteAction;
  }

  return new Action("WAIT");
};

// Weights score higher as game progresses. Makes sure that each score point is worth 3 sun points on the last day
const convertScorePointsToSunPoints = (
  scorePoints: number,
  dayToCalculateFor: number
): number => {
  let conversionRate;
  if (dayToCalculateFor < 12) {
    conversionRate = 0;
  } else if (dayToCalculateFor < 15) {
    conversionRate = 1 / 12;
  } else if (dayToCalculateFor < 17) {
    conversionRate = 1 / 8;
  } else if (dayToCalculateFor < 20) {
    conversionRate = 1 / 4;
  } else if (dayToCalculateFor < 22) {
    conversionRate = 1;
  } else {
    conversionRate = 3;
  }
  return scorePoints * conversionRate;
};

const getSunPointDifferentialForStateAfterDays = (
  staticCellData: StaticCellData,
  state: Game,
  currentDay: number,
  numDays: number
): number => {
  if (numDays <= 0) {
    return 0;
  }

  // TODO consider just looking at sun point net GAIN per turn (i.e. don't take cost into account)
  let myNewSunPoints = state.myPlayer.sunPoints;
  let opponentNewSunPoints = state.opponentPlayer.sunPoints;
  for (let day = currentDay + 1; day <= currentDay + numDays; day++) {
    myNewSunPoints += calculateSunPointsGainedForDay(
      staticCellData.directionDistanceTracker,
      state.cells,
      state.myPlayer,
      state.getAllTrees(),
      day
    );

    opponentNewSunPoints += calculateSunPointsGainedForDay(
      staticCellData.directionDistanceTracker,
      state.cells,
      state.opponentPlayer,
      state.getAllTrees(),
      day
    );
  }

  const myPointsInSunPoints = convertScorePointsToSunPoints(
    state.myPlayer.score,
    currentDay
  );
  const opponentPointsInSunPoints = convertScorePointsToSunPoints(
    state.opponentPlayer.score,
    currentDay
  );

  // console.error(
  //   `Sun point differntial -  Mine: ${myNewSunPoints} Opponent: ${opponentNewSunPoints}`
  // );
  // console.error(
  //   `Sun point from score differential -  Mine: ${myPointsInSunPoints} Opponent: ${opponentPointsInSunPoints}`
  // );

  return (
    myNewSunPoints +
    myPointsInSunPoints -
    opponentNewSunPoints -
    opponentPointsInSunPoints
  );
};

const getRequiredSunPointDifferentialForAction = (
  actionType: ACTION_TYPES,
  currentDay: number,
  expectedScore: number
): number => {
  if (actionType === "COMPLETE") {
    if (currentDay <= 10) {
      return 1;
    } else {
      return 0;
    }
  }

  // GROW
  return -1 * convertScorePointsToSunPoints(expectedScore, currentDay);
};

const getGrowOrCompleteActionWithBestSunPointPayoff = (
  game: Game,
  staticCellData: StaticCellData
): [Action | null, number] => {
  const { cells, myPlayer, day, nutrients } = game;
  const myTrees = myPlayer.getTrees();
  const tooManySmallTrees: boolean =
    myTrees.filter((tree) => tree.size === SMALL_TREE_SIZE).length >= 1;
  const tooManyLargeTrees: boolean =
    myTrees.filter((tree) => tree.size === LARGE_TREE_SIZE).length >= 5;
  const { sunPoints: mySunPoints } = myPlayer;
  let bestTree: Tree = null;
  let bestTreeRichness: number = -1;
  let bestResultingSunPointsDifferential: number = -1000000;
  let bestActionGainExcludingCost = 0;
  const ignoreCost = day < 21;
  const numDaysToLookAhead = day < 17 ? 2 : 1;
  const daysRemainingIncludingCurDay = NUM_DAYS - game.day;
  const preActionSunPointDifferential =
    getSunPointDifferentialForStateAfterDays(
      staticCellData,
      game,
      day,
      numDaysToLookAhead
    );

  myTrees
    .filter(
      (tree) =>
        !tree.isDormant &&
        daysRemainingIncludingCurDay >= tree.getMinDaysToComplete()
    )
    .forEach((tree) => {
      const cellForTree = cells[tree.cellIndex];
      if (tooManySmallTrees && tree.size === SEED_TREE_SIZE) {
        return;
      }

      const nextAction = tree.getNextAction();
      if (
        nextAction === null ||
        (tooManyLargeTrees && nextAction.type === "GROW")
      ) {
        return;
      }

      const actionCost = calculateTreeActionCost(
        myTrees,
        nextAction.type,
        tree
      );
      if (actionCost <= mySunPoints) {
        // console.error(`My existing score: ${game.myPlayer.score}`);
        const newGameState = determineGameStateAfterGrowOrCompleteAction(
          game,
          nextAction
        );
        // console.error(`My new score: ${newGameState.myPlayer.score}`);

        const sunPointDifferential = getSunPointDifferentialForStateAfterDays(
          staticCellData,
          newGameState,
          day,
          numDaysToLookAhead
        );

        const expectedScore = calculateScoreForCompleteAction(
          nutrients,
          cellForTree.richness
        );
        const requiredSunPointDifferentialGain =
          getRequiredSunPointDifferentialForAction(
            nextAction.type,
            day,
            expectedScore
          );
        const sunPointDifferentialGain =
          sunPointDifferential +
          (ignoreCost ? actionCost : 0) -
          preActionSunPointDifferential;

        if (
          !tooManyLargeTrees &&
          sunPointDifferentialGain < requiredSunPointDifferentialGain
        ) {
          // console.error(
          //   `Filtering ${nextAction.type} action on target cell index ${nextAction.targetCellIdx}. It has a differential gain of ${sunPointDifferentialGain} but requires ${requiredSunPointDifferentialGain}`
          // );
          return;
        }

        // TODO consider tie breaker on action type
        if (
          bestResultingSunPointsDifferential < sunPointDifferential ||
          (bestResultingSunPointsDifferential < sunPointDifferential &&
            cellForTree.richness > bestTreeRichness)
        ) {
          bestResultingSunPointsDifferential = sunPointDifferential;
          bestTreeRichness = cellForTree.richness;
          bestTree = tree;
          bestActionGainExcludingCost =
            bestResultingSunPointsDifferential + (ignoreCost ? actionCost : 0);
        }
      }
    });

  return [bestTree?.getNextAction() || null, bestActionGainExcludingCost];
};

export default getActionForSunPointSaverStrategy;

import Action from "./Action";

export const SEED_TREE_SIZE = 0;
export const SMALL_TREE_SIZE = 1;
export const MEDIUM_TREE_SIZE = 2;
export const LARGE_TREE_SIZE = 3;
export const LARGEST_TREE_SIZE = 3;
export const ACTIONS_IN_TREE_LIFECYCLE = 5;

export default class Tree {
  cellIndex: number;
  size: number;
  isMine: boolean;
  isDormant: boolean;

  constructor(
    cellIndex: number,
    size: number,
    isMine: boolean,
    isDormant: boolean
  ) {
    this.cellIndex = cellIndex;
    this.size = size;
    this.isMine = isMine;
    this.isDormant = isDormant;
  }

  getTreeAfterGrow = (): Tree => {
    if (this.size === LARGEST_TREE_SIZE) {
      console.error(
        `Tried to grow a tree of size ${LARGEST_TREE_SIZE} which is not possible`
      );
      return this;
    }

    return new Tree(this.cellIndex, this.size + 1, this.isMine, true);
  };

  getNextAction = (): Action | null => {
    if (this.isDormant) {
      return null;
    }

    if (this.size === LARGEST_TREE_SIZE) {
      return new Action("COMPLETE", null, this.cellIndex);
    }
    return new Action("GROW", null, this.cellIndex);
  };

  /**
   * Includes the current day only if this tree isn't dormant
   */
  getMinDaysToComplete = (): number => {
    const extraTurnIfDormant = this.isDormant ? 1 : 0;
    // +1 for the COMPLETE action
    return LARGEST_TREE_SIZE + 1 - this.size + extraTurnIfDormant;
  };

  /**
   * Return the number of sun points this tree has the capacity to gain during the sun collection phase at the beginning
   * of each day. This doesn't do any checks to see if it is in a shadow right now
   */
  getSunPointGainPerDay = (): number => this.size;

  toString = () => JSON.stringify(this);

  equals = (other: Tree): boolean =>
    !!other &&
    this.cellIndex === other.cellIndex &&
    this.size === other.size &&
    this.isMine === other.isMine &&
    this.isDormant === other.isDormant;
}

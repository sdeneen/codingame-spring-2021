const WAIT = "WAIT";
const SEED = "SEED";
const GROW = "GROW";
const COMPLETE = "COMPLETE";

type ACTION_TYPES = typeof WAIT | typeof SEED | typeof GROW | typeof COMPLETE;

export default class Action {
  type: ACTION_TYPES;
  sourceCellIdx: number;
  targetCellIdx: number;

  constructor(type: typeof WAIT);

  constructor(type: typeof SEED, sourceCellIdx: number, targetCellIdx: number);

  constructor(
    type: typeof GROW | typeof COMPLETE,
    source: null,
    targetCellIdx: number
  );

  constructor(
    type: ACTION_TYPES,
    sourceCellIdx?: number,
    targetCellIdx?: number
  ) {
    this.type = type;
    this.sourceCellIdx = sourceCellIdx;
    this.targetCellIdx = targetCellIdx;
  }

  static parse(line: string) {
    const parts = line.split(" ");

    switch (parts[0]) {
      case WAIT:
        return new Action(WAIT);

      case SEED:
        return new Action(SEED, parseInt(parts[1]), parseInt(parts[2]));

      default:
        throw new Error("Not implemented");
    }
  }

  toString() {
    if (this.type === WAIT) {
      return WAIT;
    }

    if (this.type === SEED) {
      return `${SEED} ${this.sourceCellIdx} ${this.targetCellIdx}`;
    }

    return `${this.type} ${this.targetCellIdx}`;
  }
}

export { ACTION_TYPES };

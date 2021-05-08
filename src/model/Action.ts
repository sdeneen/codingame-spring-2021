const WAIT = 'WAIT';
const SEED = 'SEED';
const GROW = 'GROW';
const COMPLETE = 'COMPLETE';

type ACTION_TYPES = typeof WAIT | typeof SEED | typeof GROW | typeof COMPLETE;

export default class Action {
    type: ACTION_TYPES;
    targetCellIdx: number;
    sourceCellIdx: number;

    constructor(type: typeof WAIT);

    constructor(
        type: typeof SEED,
        targetCellIdx: number,
        sourceCellIdx: number
    );

    constructor(type: typeof GROW | typeof COMPLETE, targetCellIdx: number);

    constructor(type: string, targetCellIdx?: number, sourceCellIdx?: number);

    constructor(
        type: ACTION_TYPES,
        targetCellIdx?: number,
        sourceCellIdx?: number
    ) {
        this.type = type;
        this.targetCellIdx = targetCellIdx;
        this.sourceCellIdx = sourceCellIdx;
    }

    static parse(line: string) {
        const parts = line.split(' ');

        switch(parts[0]) {
            case WAIT:
                return new Action(WAIT);

            case SEED:
                return new Action(SEED, parseInt(parts[2]), parseInt(parts[1]));

            default:
                return new Action(parts[0], parseInt(parts[1]));
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
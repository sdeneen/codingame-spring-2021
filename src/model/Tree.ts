import Action from "./Action";

export const SEED_TREE_SIZE = 0;
export const SMALL_TREE_SIZE = 1;
export const MEDIUM_TREE_SIZE = 2;
export const LARGE_TREE_SIZE = 3;
export const LARGEST_TREE_SIZE = 3;

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

    getNextAction = (): Action | null => {
        if (this.isDormant) {
            return null;
        }

        if (this.size === LARGEST_TREE_SIZE) {
            return new Action('COMPLETE', null, this.cellIndex);
        }
        const retAction = new Action('GROW', null, this.cellIndex);
        return retAction;
    };

    getSunPointGainPerTurn = (): number => this.size;
};

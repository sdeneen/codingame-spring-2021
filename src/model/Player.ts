import deepCopy from "../utils/deepCopy";
import { coalesce } from "../utils/nullUtils";
import Tree from './Tree';

interface PlayerFields {
    sunPoints: number,
    score: number,
    cellIndexToTree: Record<number, Tree>,
    isAsleep: boolean,
}

export default class Player {
    sunPoints: number;
    score: number;
    cellIndexToTree: Record<number, Tree>;
    isAsleep: boolean; // whether or not the player is asleep until the next day

    constructor(
        sunPoints: number,
        score: number,
        trees: Tree[],
        isAsleep: boolean,
    ) {
        this.sunPoints = sunPoints;
        this.score = score;
        this.cellIndexToTree = {}
        trees.forEach(tree => this.cellIndexToTree[tree.cellIndex] = tree);
        this.isAsleep = isAsleep;
    }

    /**
     * Gets all the player's trees
     */
    getTrees = (): Tree[] => Object.values(this.cellIndexToTree);

    /**
     * Get a deep copy of this object, replacing any provided fields
     */
    getModifiedDeepCopy = ({ sunPoints, score, cellIndexToTree, isAsleep }: Partial<PlayerFields>): Player =>
        new Player(
            coalesce(sunPoints, this.sunPoints),
            coalesce(score, this.score),
            Object.values(coalesce(cellIndexToTree, deepCopy(this.cellIndexToTree))),
            coalesce(isAsleep, this.isAsleep),
        );

    toString = () => JSON.stringify(this);

    equals = (other: Player): boolean => this.sunPoints === other.sunPoints
        && this.score === other.score
        && this.isAsleep === other.isAsleep
        && Object.keys(this.cellIndexToTree).length === Object.keys(other.cellIndexToTree).length
        && Object.keys(this.cellIndexToTree).every(key => other.cellIndexToTree[key].equals(this.cellIndexToTree[key]));
};
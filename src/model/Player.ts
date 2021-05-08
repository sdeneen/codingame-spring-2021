import Tree from './Tree';

export default class Player {
    sunPoints: number;
    score: number;
    trees: Record<number, Tree>;
    isAsleep: boolean; // whether or not the player is asleep until the next day

    constructor(
        sunPoints: number,
        score: number,
        trees: Record<number, Tree>,
        isAsleep: boolean,
    ) {
        this.sunPoints = sunPoints;
        this.score = score;
        this.trees = trees;
        this.isAsleep = isAsleep;
    }
};
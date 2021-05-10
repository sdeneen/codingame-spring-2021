import { ACTION_TYPES } from "../model/Action";
import Tree, { SEED_TREE_SIZE, SMALL_TREE_SIZE, MEDIUM_TREE_SIZE, LARGE_TREE_SIZE } from "../model/Tree";

const COST_TO_COMPLETE_TREE = 4;

const getTreesWithSize = (trees: Tree[], size: number): number => trees.filter(t => t.size === size).length;

const calculateTreeActionCost = (ownedTrees: Tree[], actionType: ACTION_TYPES, tree: Tree): number => {
    switch (actionType) {
        case "COMPLETE":
            return COST_TO_COMPLETE_TREE;
        case "GROW":
            switch (tree.size) {
                case SEED_TREE_SIZE:
                    return 1 + getTreesWithSize(ownedTrees, SMALL_TREE_SIZE);
                case SMALL_TREE_SIZE:
                    return 3 + getTreesWithSize(ownedTrees, MEDIUM_TREE_SIZE);
                case MEDIUM_TREE_SIZE:
                    return 7 + getTreesWithSize(ownedTrees, LARGE_TREE_SIZE);
                default:
                    throw new Error(`We shouldn't be asking the cost of growing a tree of size ${tree.size}`);
            }
        case "SEED":
            return getTreesWithSize(ownedTrees, SEED_TREE_SIZE);
        default:
            return 0;
    }
};

export default calculateTreeActionCost;

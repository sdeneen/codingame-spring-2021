import Action from "../model/Action";
import Tree from "../model/Tree";

const COST_TO_COMPLETE_TREE = 4;

const getTreesWithSize = (trees: Tree[], size: number): number => trees.filter(t => t.size === size).length;

const calculateTreeActionCost = (ownedTrees: Tree[], action: Action, tree: Tree): number => {
    switch (action.type) {
        case "COMPLETE":
            return COST_TO_COMPLETE_TREE;
        case "GROW":
            switch (tree.size) {
                case 1:
                    return 3 + getTreesWithSize(ownedTrees, 2);
                case 2:
                    return 7 + getTreesWithSize(ownedTrees, 3);
                default:
                    throw new Error(`We shouldn't be asking the cost of growing a tree of size ${tree.size}`);
            }
        case "SEED":
            // TODO
            return 0;
        default:
            return 0;
    }
};

export default calculateTreeActionCost;

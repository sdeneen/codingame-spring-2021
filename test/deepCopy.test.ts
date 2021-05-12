import Game from "../src/model/Game";
import Cell from "../src/model/Cell";
import Player from "../src/model/Player";
import Tree from "../src/model/Tree";

const getPlayer = (isMine: boolean, sunPoints = 1) => new Player(sunPoints, 2, [new Tree(1, 2, isMine, false)], false);

test('it deep copies Game', () => {
    const oldNutrients = 2;
    const newNutrients = 5;
    const game = new Game(
       1,
       oldNutrients,
       [new Cell(0, 1, [1, 2, 3, 4, 5, 6])],
       getPlayer(true),
       getPlayer(false),
    );

    const newGame = game.getModifiedDeepCopy({
       nutrients: newNutrients,
    });

    expect(game.nutrients).toEqual(oldNutrients);
    expect(newGame.nutrients).toEqual(newNutrients);

    newGame.day = 5;
    expect(newGame.day).toEqual(5);
    expect(game.day).toEqual(1);

    newGame.myPlayer = getPlayer(true, 500);
    expect(newGame.myPlayer.sunPoints).toEqual(500);
    expect(game.myPlayer.sunPoints).toEqual(1);
    newGame.myPlayer.sunPoints = 20;
    expect(newGame.myPlayer.sunPoints).toEqual(20);
    expect(game.myPlayer.sunPoints).toEqual(1);

    newGame.cells.push(new Cell(1, 1, [1, 2, 3, 4, 5, 6]));
    expect(newGame.cells).toHaveLength(2);
    expect(game.cells).toHaveLength(1);

    newGame.cells[0].index = 50;
    expect(newGame.cells[0].index).toEqual(50);
    expect(game.cells[0].index).toEqual(0);
});

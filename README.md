# codingame-spring-2021
Our beaut strategy for dominating [the Spring Challenge 2021](https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2021). (May 6 – 17, 2021)

![image](https://user-images.githubusercontent.com/5615725/120074067-19177980-c069-11eb-9c74-2db9548e8538.png)

## Results
![image](https://user-images.githubusercontent.com/5615725/120074223-d3a77c00-c069-11eb-9349-b5a4b664b5a3.png)


## Setting up dev environment
Just install [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable).

## Bundle files for copying to the Codingame code editor
Run the following command on Mac to build the code and automatically copy the generated JS file to your clipboard.
Then you just need to paste it into Codingame.

`sh bundleFilesAndCopy.sh`

## Development notes
This repo uses [Rollup](https://rollupjs.org/guide/en/) to bundle files. Configuration is in rollup.config.js.

We include a [Rollup Typescript plugin](https://www.npmjs.com/package/@rollup/plugin-typescript) to get type checking
via [Typescript](https://www.typescriptlang.org/docs/).

We use [Jest](https://jestjs.io/) for unit testing, and rely on [ts-jest](https://github.com/kulshekhar/ts-jest) for Jest testing to work with Typescript.

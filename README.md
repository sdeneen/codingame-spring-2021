# codingame-spring-2021

https://www.codingame.com/ide/challenge/spring-challenge-2021

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
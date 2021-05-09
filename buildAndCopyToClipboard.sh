yarn install
node_modules/rollup/dist/bin/rollup -c
yarn test
cat dist/bundle.js | pbcopy

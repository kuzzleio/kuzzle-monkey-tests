# Kuzzle multi-client tests

:warning: Work in progress - Not ready for production

Run functional tests on Kuzzle in parallel from a pool of heteregeneous clients.

## How to use

1. tweak the `lib/config.js` file to your needs or use a `.ktestsrc` file
2. run the tests: `node index.js`

You can replay a sequence by feeding the script with a seed, i.e.:

```
SEED=456465324 node.index
```



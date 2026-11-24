'use strict';

const Suite = require('./lib');

let suite = new Suite();

suite.init()
  .then(() => {
    console.log(`seed: ${suite.seed}\n\n`);

    return suite.scheduler.run();
  })
  .then(() => suite.drain())
  .catch(e => {
    // An init failure (e.g. Kuzzle unreachable) used to exit with code 0.
    console.error(e);
    suite.failed = true;
  })
  .finally(() => {
    suite.end();
  });

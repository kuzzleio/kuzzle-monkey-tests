const
  Suite = require('./lib');

let suite = new Suite();

return suite.init()
  .then(() => {
    console.log(`seed: ${suite.seed}\n\n`);

    return suite.scheduler.run();
  })
  .catch(e => {
    console.error(e);
  })
  .finally(() => {
    suite.end();
  });

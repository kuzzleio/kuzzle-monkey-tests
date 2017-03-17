const
  Suite = require('./lib');

let suite = new Suite();

return suite.init()
  .then(() => {
    console.log(`seed: ${suite.seed}\n\n`);

    const Subscribe = require('./lib/tests/actions/subscribe');
    const sub = new Subscribe(suite);
    return sub.run();
  })
  .then(() => {
    const Publish = require('./lib/tests/scenarios/publish');
    const pub = new Publish(suite);
    return pub.run();
  })
  .catch(e => {
    console.error(e);
  })
  .finally(() => {
    console.log(`\n\nseed: ${suite.seed}`);
  });

const
  Suite = require('./lib');

let suite = new Suite();

return suite.init()
  .then(() => {
    console.log(`seed: ${suite.seed}\n\n`);

    const Subscribe = require('./lib/tests/realtime/subscribe');
    const sub = new Subscribe(suite);
    return sub.run();
  })
  .then(() => {
    const Publish = require('./lib/tests/realtime/publish');
    const pub = new Publish(suite);
    return pub.run();
  })
  .then(() => {
    const
      Scheduler = require('./lib/scheduler'),
      scheduler = new Scheduler(suite);

    scheduler.run();


  })
  .catch(e => {
    console.error(e);
  })
  .finally(() => {
    console.log(`\n\nseed: ${suite.seed}`);
  });

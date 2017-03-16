const
  Suite = require('./lib');

let suite = new Suite();

return suite.init()
  .then(() => {
    const Subscription = require('./lib/world/subscriptions/subscription');
    const s = new Subscription(suite);
    console.dir(s.filter.filter, {depth: null});
    console.log(s.filter.matches.size)
  })
  .catch(e => {
    console.error(e);
  })
  .finally(() => {
    console.log(`seed: ${suite.seed}`);
    process.exit()
  });

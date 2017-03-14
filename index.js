const
  Suite = require('./lib');

let suite = new Suite();

return suite.init()
  .then(() => {
    console.log(suite);
  });

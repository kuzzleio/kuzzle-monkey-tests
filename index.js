const
  Suite = require('./lib');

let suite = new Suite();

return suite.init()
  .then(() => {
    EqualFilter = require('./lib/filters/equals');
    ExistsFIlter = require('./lib/filters/exists');
    RangeFilter = require('./lib/filters/range');

    const f = new EqualFilter(suite);
//    console.log(f);

    const f2 = new ExistsFIlter(suite, 'toto');
    console.log(f2);

    const f3 = new RangeFilter(suite, 'int');
    console.log(f3);
  });

const
  config = require('./config'),
  Random = require('random-js'),
  World = require('./world');

class Suite {

  constructor (params) {
    this.config = config;

    const opts = Object.assign({}, params);
    if (opts.clients && opts.clients.number) {
      this.config.clients.number = opts.clients.number;
    }

    if (process.env.SEED) {
      this.seed = process.env.SEED;
    }
    else {
      this.seed = Random.engines.mt19937().autoSeed()();
    }
    this.rand = new Random(Random.engines.mt19937().seed(this.seed));

    this.world = new World(this);
  }

  init () {
    return this.world.init();
  }


}

module.exports = Suite;

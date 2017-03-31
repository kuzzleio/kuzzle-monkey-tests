require('reify');

const
  config = require('./config'),
  Random = require('random-js'),
  Scheduler = require('./scheduler'),
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

    this.scheduler = new Scheduler(this);
    this.world = new World(this);

    process.on('SIGINT', () => this.end());
  }

  init () {
    return this.world.init();
  }

  end (code = 0) {
    console.log('\n');
    console.log(JSON.stringify(this.world.stats, undefined, 2));
    console.log(`duration: ${Date.now() - this.world.stats.started}ms`);
    console.log('rpm: ' + this.world.stats.requests.total / (Date.now() - this.world.stats.started) * 60 * 1000);
    console.log('\n\nseed: ' + this.seed);
    process.exit(0);
  }


}

module.exports = Suite;

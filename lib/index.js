const
  config = require('./config'),
  Promise = require('bluebird'),
  Random = require('random-js'),
  WebsocketClient = require('./clients/websocketClient'),
  World = require('./world');

class Suite {

  constructor (params) {
    this.config = config;

    const opts = Object.assign({}, params);
    if (opts.clients && opts.clients.number) {
      this.config.clients.number = opts.clients.number;
    }

    this.clients = [];
    this._createClientPool();

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
    this.world.init();
    return this._initClientPool();
  }

  getClient () {
    return this.rand.pick(this.clients);
  }

  _createClientPool () {
    for (let i = 0; i < this.config.clients.number; i++) {
      this.clients.push(new WebsocketClient(this));
    }
  }

  _initClientPool () {
    return Promise.all(this.clients.map(client => client.init()));
  }

}

module.exports = Suite;

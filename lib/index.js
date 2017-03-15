const
  Client = require('./client'),
  config = require('./config'),
  random = require('random-seed'),
  uuid = require('uuid'),
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

    this.seed = uuid.v4();
    this.rand = random.create(this.seed);

    this.world = new World(this);
  }

  init () {
    return this._initClientPool();
  }

  getClient () {
    return this.clients[this.rand(this.clients.length)];
  }

  oneOf (arr) {
    return arr[this.rand(arr.length)];
  }

  _createClientPool () {
    for (let i = 0; i < this.config.clients.number; i++) {
      const protocol = 'websocket';

      this.clients.push(new Client(this, protocol));
    }
  }

  _initClientPool () {
    return Promise.all(this.clients.map(client => client.init()));
  }

}

module.exports = Suite;

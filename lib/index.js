const
  Client = require('./client'),
  config = require('./config'),
  Promise = require('bluebird')
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

    this.world = new World(this);
  }

  init () {
    const Document = require('./world/document');
    for (let i = 0; i < 10; i++) {
      let doc = new Document();
      console.log(doc.serialize());

    }
    return this._initClientPool();
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

const
  Document = require('./document'),
  DockerNames = require('./dockerNames'),
  ProgressBar = require('progress'),
  Bluebird = require('bluebird'),
  Subscription = require('./subscription'),
  uuid = require('uuid/v4'),
  WebsocketClient = require('./clients/websocketClient');

let
  _suite,
  dockerNames;

class World {

  constructor (suite) {
    _suite = suite;
    dockerNames = new DockerNames(suite);

    this._ids = new Map();

    this.indexes = {
      india: ['chennai', 'coimbatore', 'cuttak'],
      ireland: ['clifden', 'cork']
    };

    this.clients = [];

    this._documents = new Map();
    this.documents = {};

    this.subscriptions = {};
    this.subscriptionsUnconfirmed = new Set();
    this.rooms = new Map();

    this.stats = {
      notifications: {
        count: 0,
        time: 0
      },
      requests: {
        total: 0,
        time: 0,
        controllers: {}
      },
      started: null
    };
  }

  deleteRoom (room) {
    this.rooms.all.delete(room);
    this.rooms.byIndex
      .get(room.index)
      .get(room.collection)
      .delete(room);
  }

  init () {
    return this._initClients()
      .then(() => {
        this._buildDocuments();
        this._buildSubscriptions();
      });
  }

  getClient () {
    return _suite.rand.pick(this.clients);
  }

  getDocument (id) {
    if (id) {
      return this._documents.get(id);
    }

    const
      index = _suite.rand.pick(Object.keys(this.documents)),
      collection = _suite.rand.pick(Object.keys(this.documents[index]));

    return _suite.rand.pick([...this.documents[index][collection].values()]);
  }

  getId (type, retry = 0) {
    if (!this._ids.has(type)) {
      this._ids.set(type, new Set());
    }

    let name = dockerNames.getRandomName();

    if (!this._ids.get(type).has(name)) {
      this._ids.get(type).add(name);
      return name;
    }

    if (retry <= 5) {
      return this.getId(type, retry + 1);
    }
    else if (retry > 5) {
      // lots of collisions - try adding a small random int
      name = name + _suite.rand.integer(0, 100);
      if (!this._ids.get(type).has(name)) {
        this._ids.get(type).add(name);
        return name;
      }

      return this.getId(type, retry + 1);
    }
    else if (retry > 10) {
      // too many collisions, switch back to uuid
      return uuid();
    }
  }

  getRoom () {
    return _suite.rand.pick([...this.rooms.values()]);
  }

  getSubscription () {
    const
      index = _suite.rand.pick(Object.keys(this.subscriptions)),
      collection = _suite.rand.pick(Object.keys(this.subscriptions[index]));
    return _suite.rand.pick([...this.subscriptions[index][collection]]);
  }

  padLeft (str, len) {
    if (str.length >= len) {
      return str;
    }
    
    return ' '.repeat(len - str.length) + str;
  }

  padRight (str, len) {
    if (str.length >= len) {
      return str;
    }

    return str + ' '.repeat(len - str.length);
  }

  _buildDocuments () {
    const number = _suite.config.documents.number;

    _suite.log('Generating documents');
    const bar = this._bar(number);

    for (let i = 0; i < number; i++) {
      const doc = new Document(_suite);
      bar.tick();

      this._documents.set(doc._id, doc);

      if (!this.documents[doc.index]) {
        this.documents[doc.index] = {};
      }

      if (!this.documents[doc.index][doc.collection]) {
        this.documents[doc.index][doc.collection] = new Map();
      }

      this.documents[doc.index][doc.collection].set(doc._id, this._documents.get(doc._id));
    }
  }

  _buildSubscriptions () {
    const number = _suite.config.subscriptions.number;

    _suite.log('Generating subscriptions');
    const bar = this._bar(number);

    for (let i = 0; i < number; i++) {
      const subscription = new Subscription(_suite);
      bar.tick();

      for (const doc of subscription.matches()) {
        doc.subscriptions.add(subscription);
      }

      if (!this.subscriptions[subscription.index]) {
        this.subscriptions[subscription.index] = {};
      }

      if (!this.subscriptions[subscription.index][subscription.collection]) {
        this.subscriptions[subscription.index][subscription.collection] = new Set();
      }

      this.subscriptions[subscription.index][subscription.collection].add(subscription);
    }
  }

  _initClients () {
    const number = _suite.config.clients.number;

    _suite.log('Initiating clients');
    const bar = this._bar(number);

    for (let i = 0; i < _suite.config.clients.number; i++) {
      bar.tick();
      this.clients.push(new WebsocketClient(_suite));
    }

    return Bluebird.all(this.clients.map(client => client.init()));
  }

  _bar (len) {
    return new ProgressBar('[:bar] :current/:total :percent', {
      total: len,
      width: 60
    });
  }
}

module.exports = World;

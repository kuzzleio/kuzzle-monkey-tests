const
  filters = require('../filters'),
  Room = require('./room');

let
  _suite,
  _world;

class Subscription {

  constructor(suite) {
    _suite = suite;
    _world = suite.world;

    const depth = suite.rand.integer(0, suite.config.subscriptions.maxDepth);
    this.filter = this._build(depth);

    this.index = suite.rand.pick(Object.keys(suite.world.indexes));
    this.collection = suite.rand.pick(suite.world.indexes[this.index]);

    this.pendingClients = new Set();
    this.clients = new Set();

    this._matches = null;
    this._roomId = null;
  }

  get room () {
    return _world.rooms.all.get(this.roomId);
  }

  get roomId () {
    return this._roomId;
  }

  set roomId (id) {
    if (this._roomId === null) {

      let room;

      if (!_world.rooms.all.has(id)) {
        room = new Room(id);
        _world.rooms.all.set(id, room);
      }
      else {
        room = _world.rooms.all.get(id);
      }

      room.subscriptions.add(this);

      if (!_world.rooms.byIndex.has(this.index)) {
        _world.rooms.byIndex.set(this.index, new Map());
      }
      if (!_world.rooms.byIndex
          .get(this.index)
          .has(this.collection)) {
        _world.rooms.byIndex
          .get(this.index)
          .set(this.collection, new Map());
      }
      if (!_world.rooms.byIndex
          .get(this.index)
          .get(this.collection)
          .has(id)) {
        _world.rooms.byIndex
          .get(this.index)
          .get(this.collection)
          .set(id, room);
      }

      this._roomId = id;
    }
  }

  matches () {
    if (this._matches === null) {
      this.refreshMatches();
    }
    return this._matches;
  }

  refreshMatches () {
    this._matches = this.filter.matches(_suite.world.documents[this.index][this.collection]);
  }

  _build (depth) {
    if (depth === 0) {
      return new filters.filters[_suite.rand.pick(Object.keys(filters.filters))](_suite);
    }

    const
      filtersNb = _suite.rand.integer(2, _suite.config.subscriptions.maxCompoundFilters),
      Operand = filters.operands[_suite.rand.pick(Object.keys(filters.operands))],
      operandFilters = [];

    for (let i = 0; i < filtersNb; i++) {
      operandFilters.push(this._build(depth - 1));
    }
    return new Operand(_suite, ...operandFilters);
  }

}

module.exports = Subscription;


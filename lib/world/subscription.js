const
  filters = require('../filters');

let
  _suite;

class Subscription {

  constructor(suite) {
    _suite = suite;

    const depth = suite.rand.integer(0, suite.config.subscriptions.maxDepth);
    this.filter = this._build(depth);

    this.clients = new Set();
    this._requests = new Set();
    this.roomId = null;
  }

  /**
   *
   * @param {Client} client
   */
  addClient (client) {
    this.clients.add(client);
  }

  /**
   * @param {Client} client
   */
  removeClient (client) {
    this.clients.delete(client);
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


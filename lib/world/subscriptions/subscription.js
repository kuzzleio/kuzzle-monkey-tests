const
  filters = require('../../filters');

let
  _suite;

class Subscription {

  constructor(suite) {
    _suite = suite;

    const depth = suite.rand(suite.config.subscriptions.maxDepth + 1);
    this.filter = this._build(depth);
  }

  _build (depth) {
    if (depth === 0) {
      return new filters.filters[_suite.oneOf(Object.keys(filters.filters))](_suite);
    }

    const
      filtersNb = _suite.rand(_suite.config.subscriptions.maxCompoundFilters) + 2,
      Operand = filters.operands[_suite.oneOf(Object.keys(filters.operands))],
      operandFilters = [];

    for (let i = 0; i < filtersNb; i++) {
      operandFilters.push(this._build(depth - 1));
    }
    return new Operand(_suite, ...operandFilters);
  }

}

module.exports = Subscription;


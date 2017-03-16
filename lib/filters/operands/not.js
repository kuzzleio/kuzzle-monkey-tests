const
  Operand = require('./operand');

class Not extends Operand {

  constructor (suite, ...filters) {
    super(suite, filters);

    for (let f of filters) {
      this._filter = f;
    }
    this.filters = new Set([this._filter]);
  }

  add (...filters) {
    for (let f of filters) {
      this._filter = filter;
    }
    this.filters = new Set([this._filter]);
  }

  get matches () {
    return new Set([...this._suite.world.documents]
      .filter(doc => !this._filter.matches.has(doc)));
  }

  get filter () {
    return {
      not: this._filter.filter
    };
  }
}

module.exports = Not;

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

  matches () {
    const childMatches = this._filter.matches();

    return new Set([...this._suite.world.documents.values()]
      .filter(doc => !childMatches.has(doc)));
  }

  filter () {
    return {
      not: this._filter.filter()
    };
  }
}

module.exports = Not;

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

  matches (allDocs) {
    const childMatches = this._filter.matches(allDocs);

    return new Set([...allDocs.values()]
      .filter(doc => !childMatches.has(doc)));
  }

  filter () {
    return {
      not: this._filter.filter()
    };
  }
}

module.exports = Not;

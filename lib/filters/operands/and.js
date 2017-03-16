const
  Operand = require('./operand');

class And extends Operand {

  get matches () {
    if (this.filters.size === 0) {
      return new Set();
    }

    return new Set([...this.filters]
      .map(f => f.matches)
      .reduce((acc, curr) => {
        return new Set([...curr].filter(x => acc.has(x)));
      }));
  }

  get filter () {
    return {
      and: [...this.filters].map(f => f.filter)
    }
  }
}

module.exports = And;

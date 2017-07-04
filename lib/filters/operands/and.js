const
  Operand = require('./operand');

class And extends Operand {

  matches (allDocs) {
    if (this.filters.size === 0) {
      return new Set();
    }

    return [...this.filters]
      .map(f => f.matches(allDocs))
      .reduce((acc, curr) => {
        return new Set([...curr].filter(x => acc.has(x)));
      });
  }

  filter () {
    return {
      and: [...this.filters].map(f => f.filter())
    };
  }
}

module.exports = And;

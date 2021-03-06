'use strict';

const Operand = require('./operand');

class Or extends Operand {
  matches (allDocs) {
    return [...this.filters]
      .map(f => f.matches(allDocs))
      .reduce((acc, curr) => new Set([...acc, ...curr]));
  }

  filter () {
    return {
      or: [...this.filters].map(f => f.filter())
    };
  }

}

module.exports = Or;

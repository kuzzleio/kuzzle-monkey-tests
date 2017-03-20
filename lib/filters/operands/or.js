const
  Operand = require('./operand');

class Or extends  Operand {

  matches () {
    return new Set([...this.filters]
      .map(f => f.matches())
      .reduce((acc, curr) => {
        return new Set([...acc, ...curr]);
      })
    );
  }

  filter () {
    return {
      or: [...this.filters].map(f => f.filter())
    };
  }

}

module.exports = Or;

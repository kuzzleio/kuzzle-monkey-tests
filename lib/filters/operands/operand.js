const
  Filter = require('../filter');

class Operand extends Filter {

  /**
   * @param {Filter} filters
   */
  constructor (suite, ...filters) {
    super(suite);

    this.filters = new Set(filters);
  }

  add (...filters) {
    for (let f of filters) {
      this.filters.add(f);
    }
  }

  remove (...filters) {
    for (let f of filters) {
      this.filters.remove(f);
    }
  }

  /**
   * @returns {Set.<Document>}
   */
  get matches () {
    throw new Error('not implemented');
  }

}

module.exports = Operand;

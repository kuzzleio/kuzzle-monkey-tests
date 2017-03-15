const
  Filter = require('./filter');

class Ids extends Filter {

  /**
   * @param {Suite} suite
   * @param {string[]} ids
   */
  constructor (suite, ids) {
    super(suite);

    this.ids = ids;

    this.refreshMatches();
  }

  get filter () {
    return {
      ids: {
        values: this.ids
      }
    };
  }

  _filterMatches (doc) {
    return this.ids.indexOf(doc._id) > -1;

  }

}

module.exports = Ids;

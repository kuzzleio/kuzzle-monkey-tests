const
  Filter = require('./filter');

class Ids extends Filter {

  /**
   * @param {Suite} suite
   * @param {string[]} ids
   */
  constructor (suite, ids) {
    super(suite);

    if (ids === undefined) {
      const _ids = new Set();
      for (let i = 0; i < suite.rand.integer(1, 30); i++) {
        const doc = suite.rand.pick([...suite.world.documents]);
        _ids.add(doc._id);
      }
      ids = [..._ids];
    }

    this.ids = ids;
  }

  filter () {
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

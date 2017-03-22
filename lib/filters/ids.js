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
        _ids.add(suite.rand.pick([...suite.world.documents.keys()]));
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

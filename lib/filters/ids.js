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
        const
          index = suite.rand.pick(Object.keys(suite.world.documents)),
          collection = suite.rand.pick(Object.keys(suite.world.documents[index]));

        _ids.add(suite.rand.pick([...suite.world.documents[index][collection].keys()]));
      }
      this.ids = [..._ids];
    }
    else {
      this.ids = ids;
    }
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

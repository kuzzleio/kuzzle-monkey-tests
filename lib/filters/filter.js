let
  _suite;

/**
 * @interface
 */
class Filter {

  constructor (suite) {
    _suite = suite;
  }

  filter () {
    throw new Error('not implemented');
  }

  matches () {
    return new Set([...this._suite.world.documents]
      .filter(doc => this._filterMatches(doc)));
  }

  get _suite () {
    return _suite;
  }

  _filterMatches (doc) {
    throw new Error('not implemented');
  }

}

module.exports = Filter;

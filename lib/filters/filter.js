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

  matches (allDocs) {
    return new Set([...allDocs.values()]
      .filter(doc => this._filterMatches(doc)));
  }

  get _suite () {
    return _suite;
  }

  _filterMatches () {
    throw new Error('not implemented');
  }

}

module.exports = Filter;

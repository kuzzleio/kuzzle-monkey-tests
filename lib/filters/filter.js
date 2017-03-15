let
  _suite;

/**
 * @interface
 */
class Filter {

  constructor (suite) {
    _suite = suite;
    this._matches = new Set();
  }

  get filter () {
    throw new Error('not implemented');
  }

  get matches () {
    return this._matches;
  }

  get _suite () {
    return _suite;
  }

  /**
   * @param {Suite} suite
   */
  refreshMatches () {
    this._matches = Object.keys(_suite.world.documents)
      .filter(id => {
        const doc = _suite.world.documents[id];
        return this._filterMatches(doc);
      })
      .map(id => _suite.world.documents[id]);
  }

  /**
   * @private
   */
  _filterMatches () {
    throw new Error('not implemented');
  }
}

module.exports = Filter;

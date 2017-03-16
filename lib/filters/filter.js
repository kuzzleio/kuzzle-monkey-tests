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
    this._matches = new Set([..._suite.world.documents]
      .filter(doc => this._filterMatches(doc)));
  }

  /**
   * @private
   */
  _filterMatches () {
    throw new Error('not implemented');
  }
}

module.exports = Filter;

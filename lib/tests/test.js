let
  _suite;

class Test {

  constructor (suite) {
    _suite = suite;
  }

  get _suite () {
    return _suite;
  }

  get _world () {
    return this._suite.world;
  }

  /**
   * @returns {Promise}
   */
  run () {
    throw new Error('not implemented');
  }


}

module.exports = Test;

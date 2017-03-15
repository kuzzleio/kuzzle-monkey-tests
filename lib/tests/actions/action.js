let
  _suite;

class Action {

  constructor (suite) {
    _suite = suite;
  }

  get _suite () {
    return _suite;
  }

  /**
   * @returns {Promise}
   */
  run () {
    throw new Error('not implemented');
  }

}

module.exports = Action;

let
  _suite;


class Tests {

  /**
   * @param {Suite} suite
   */
  constructor (suite) {
    _suite = suite;
    this.config = _suite.config.tests;

    this.tests = require('./all');
  }

  getTest () {
    const controller = _suite.rand.pick(Object.keys(this.tests));
    const action = _suite.rand.pick(Object.keys(this.tests[controller]));

    return new this.tests[controller][action](_suite);
  }

}

module.exports = Tests;

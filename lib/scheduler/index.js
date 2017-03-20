const
  Promise = require('bluebird'),
  Tests = require('../tests');

let
  _suite;

class Scheduler {

  /**
   * @param {Suite} suite
   */
  constructor (suite) {
    _suite = suite;

    this.config = suite.config.scheduler;
    this.tests = new Tests(suite);
  }


  run () {
    return Promise.delay(2000)
      .then(() => {
        this._batch().forEach(test => test.run());
      })
      .then(() => this.run());
  }

  _batch () {
    const tests = [];

    for (let i = 0; i < 3; i++) {
      tests.push(this.tests.getTest());
    }

    return tests;
  }

}

module.exports = Scheduler;

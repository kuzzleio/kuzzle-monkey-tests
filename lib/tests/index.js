'use strict';

let _suite;

class Tests {

  /**
   * @param {Suite} suite
   */
  constructor (suite) {
    _suite = suite;
    this.config = _suite.config.tests;

    this.tests = require('./all');

    for (const controller of Object.keys(this.tests)) {
      suite.world.stats.requests.controllers[controller] = {};

      for (const action of Object.keys(this.tests[controller])) {
        suite.world.stats.requests.controllers[controller][action] = {
          average: -1,
          count: 0,
          time: 0,
          timeSquare: 0,
        };
      }
    }
  }

  getTest () {
    const controller = _suite.rand.pick(Object.keys(this.tests));
    const action = _suite.rand.pick(Object.keys(this.tests[controller]));

    return new this.tests[controller][action](_suite, controller, action);
  }

}

module.exports = Tests;

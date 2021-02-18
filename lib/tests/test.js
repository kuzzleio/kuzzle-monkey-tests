'use strict';

let _suite;

class Test {
  constructor (suite, controller, action) {
    _suite = suite;
    this.controller = controller;
    this.action = action;
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
  async run () {
    const now = Date.now();

    const response = await this._run();
    const time = Date.now() - now;
    const controller = this._world.stats.requests.controllers[this.controller][this.action];

    controller.count++;
    controller.time += time;
    controller.timeSquare += (time * time);

    let min = controller.min;

    if (min === undefined || time < min) {
      min = time;
    }

    controller.min = min;

    let max = controller.max;

    if (max === undefined || time > max) {
      max = time;
    }

    controller.max = max;

    return response;
  }

  _run () {
    throw new Error('not implemented');
  }
}

module.exports = Test;

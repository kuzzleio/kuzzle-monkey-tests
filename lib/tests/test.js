let
  _suite;

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
  run () {
    const now = Date.now();

    return this._run()
      .then(response => {
        this._world.stats.requests.controllers[this.controller][this.action].count++;
        this._world.stats.requests.controllers[this.controller][this.action].time += Date.now() - now;

        return response;
      });
  }

  _run () {
    throw new Error('not implemented');
  }


}

module.exports = Test;

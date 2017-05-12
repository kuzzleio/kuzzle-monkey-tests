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
        const time = Date.now() - now;

        this._world.stats.requests.controllers[this.controller][this.action].count++;
        this._world.stats.requests.controllers[this.controller][this.action].time += time;
        this._world.stats.requests.controllers[this.controller][this.action].timeSquare += (time * time);

        let min = this._world.stats.requests.controllers[this.controller][this.action].min;
        if (min === undefined || time < min) {
          min = time;
        }
        this._world.stats.requests.controllers[this.controller][this.action].min = min;

        let max = this._world.stats.requests.controllers[this.controller][this.action].max;
        if (max === undefined || time > max) {
          max = time;
        }
        this._world.stats.requests.controllers[this.controller][this.action].max = max;

        return response;
      });
  }

  _run () {
    throw new Error('not implemented');
  }


}

module.exports = Test;

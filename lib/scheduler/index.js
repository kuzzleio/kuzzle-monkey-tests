'use strict';

const { IntervalTree } = require('node-interval-tree');

const Bluebird = require('bluebird');
const Tests = require('../tests');

let _suite;

class Scheduler {

  /**
   * @param {Suite} suite
   */
  constructor (suite) {
    _suite = suite;

    this.config = suite.config.scheduler;
    this.tests = new Tests(suite);

    if (this.config.duration === -1) {
      this.config.duration = Infinity;
    }

    this._pShootIntervals = new IntervalTree();

    let i;
    let prev = 0;
    let sum = 0;
    const mean = _suite.config.scheduler.shootIntervalMean;
    const poissonRNG = suite.rand.poisson(mean);

    for (i = 0; i < mean * 3; i += mean / 100) {
      const p = poissonRNG();
      this._pShootIntervals.insert(prev, p, i);
      prev = p;
      sum += p;
    }
    this._pShootIntervals.insert(prev, Infinity, 1 - sum);

    // expected average number of req / interval time
    this._pShootLambda = _suite.config.scheduler.rpm / 60 / 1000 * mean;
    this._pShootSamples = 10000;
    this._pShootP = this._pShootLambda / this._pShootSamples;

    this.more = true;
  }


  async run () {
    const r = _suite.rand.float(0, 1);
    const delay = this._pShootIntervals.search(r, r)[0];

    if (_suite.world.stats.started === null) {
      _suite.world.stats.started = Date.now();
    }

    if (Date.now() - _suite.world.stats.started >= _suite.config.scheduler.duration * 1000) {
      _suite.log(`\nmax execution time reached (${_suite.config.scheduler.duration}s). exiting...`);
      return;
    }

    await Bluebird.delay(delay);

    if (!this.more) {
      return false;
    }

    const batch = this._batch();

    for (const test of batch) {
      try {
        await test.run();
      }
      catch(error) {
        _suite.report('error', {
          message: error.message,
          stack: error.stack
        });

        _suite.log('error', error);

        if (this.config.dieOnError) {
          this.more = false;
          return _suite.end(1);
        }
      }
    }

    _suite.world.stats.requests.total += batch.length;
    await this.run();
  }

  stop() {
    this.more = false;
  }

  _batch () {
    const tests = [];

    let i = this._pShootSamples;
    while (i--) {
      if (_suite.rand.float(0, 1) < this._pShootP) {
        tests.push(this.tests.getTest());
      }
    }

    return tests;
  }

}

module.exports = Scheduler;

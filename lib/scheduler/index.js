'use strict';

import IntervalTree from 'node-interval-tree';

const
  cdf = require('distributions-poisson-cdf'),
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

    this._pShootIntervals = new IntervalTree();

    let
      i,
      prev = 0,
      sum = 0;
    for (i=0; i < _suite.config.scheduler.shootIntervalMean * 3; i += _suite.config.scheduler.shootIntervalMean / 100) {
      const p = cdf(i, {lambda: _suite.config.scheduler.shootIntervalMean});
      this._pShootIntervals.insert(prev, p, i);
      prev = p;
      sum += p;
    }
    this._pShootIntervals.insert(prev, Infinity, 1 - sum);

    // expected average number of req / interval time
    this._pShootLambda = _suite.config.scheduler.rpm / 60 / 1000 * _suite.config.scheduler.shootIntervalMean;
    this._pShootSamples = 10000;
    this._pShootP = this._pShootLambda / this._pShootSamples;
  }


  run () {
    const
      r = _suite.rand.real(0, 1, false),
      delay = this._pShootIntervals.search(r, r)[0];

    if (_suite.world.stats.started === null) {
      _suite.world.stats.started = Date.now();
    }

    if (Date.now() - _suite.world.stats.started >= _suite.config.scheduler.duration * 1000) {
      console.log(`\nmax execution time reached (${_suite.config.scheduler.duration}s). exiting...`);
      return;
    }

    return Promise.delay(delay)
      .then(() => {
        const batch = this._batch();

        batch.forEach(test => test.run()
          .catch(error => {
            console.error(error);
            process.exit(1);
          }));

        _suite.world.stats.requests.total += batch.length;
        //console.log('rpm: ' + _suite.world.stats.requests.total / (Date.now() - _suite.world.stats.started) * 60 * 1000);
      })
      .then(() => this.run());
  }

  _batch () {
    const tests = [];

    let i = this._pShootSamples;
    while (i--) {
      if (_suite.rand.real(0, 1, true) < this._pShootP) {
        tests.push(this.tests.getTest());
      }
    }

    return tests;
  }

}

module.exports = Scheduler;

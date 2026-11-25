'use strict';

const Bluebird = require('bluebird');
const Tests = require('../tests');

let _suite;

/**
 * Sends the tests as a Poisson process: on average `scheduler.rpm` per
 * minute, at random (exponential) intervals, without waiting for the previous
 * ones to complete.
 *
 * The previous scheduler meant to do the same, but its interval lookup never
 * matched (kuzzleio/kuzzle-monkey-tests#2): it waited ~1ms between batches and
 * awaited each test, so it sent one request at a time, as fast as the
 * responses came back, whatever `rpm` said.
 */
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

    // mean interval between two tests, in ms
    this._nextInterval = suite.rand.exponential(this.config.rpm / 60000);
    this._inFlight = new Set();

    this.more = true;
  }

  async run () {
    const stats = _suite.world.stats;
    const end = Date.now() + this.config.duration * 1000;
    let next = Date.now();

    stats.started = Date.now();

    while (this.more) {
      const now = Date.now();

      if (now >= end) {
        stats.ended = now;
        _suite.log(`\nmax execution time reached (${this.config.duration}s). exiting...`);
        break;
      }

      // Every test whose time has come: timers fire late, and catching up
      // keeps the average rate.
      while (this.more && next <= now) {
        this._shoot();
        next += this._nextInterval();
      }

      await Bluebird.delay(Math.max(0, Math.min(next, end) - Date.now()));
    }

    // The responses of the last tests sent
    await Promise.all([...this._inFlight]);
  }

  stop() {
    this.more = false;
  }

  _shoot () {
    const test = this.tests.getTest();

    _suite.world.stats.requests.total++;

    const running = test.run()
      .catch(error => this._fail(error))
      .finally(() => this._inFlight.delete(running));

    this._inFlight.add(running);
  }

  _fail (error) {
    _suite.report('error', {
      message: error.message,
      stack: error.stack
    });

    _suite.log('error', error);
    _suite.failed = true;

    if (this.config.dieOnError) {
      this.more = false;
      return _suite.end(1);
    }
  }

}

module.exports = Scheduler;

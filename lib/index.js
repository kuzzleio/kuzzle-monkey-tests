'use strict';

// require('reify');

const crypto = require('crypto');
const Bluebird = require('bluebird');
const config = require('./config');
const seedrandom = require('seedrandom');
const random = require('random');
const util = require('util');
const Scheduler = require('./scheduler');
const winston = require('winston');
const WinstonElasticsearchTransport = require('winston-elasticsearch');
const World = require('./world');

class Suite {
  constructor (params) {
    this.config = config;
    this.stopped = false;
    // Sticky: any failure, wherever it is detected, makes the process exit
    // with a non-zero code, whatever code end() is eventually called with.
    this.failed = false;

    const opts = Object.assign({}, params);
    if (opts.clients && opts.clients.number) {
      this.config.clients.number = opts.clients.number;
    }

    this.seed = process.env.SEED || crypto.randomBytes(8).toString('hex');
    this.rand = random.clone(seedrandom(this.seed));
    this.rand.pick = arr => arr[this.rand.int(0, arr.length -1)];

    this._initLoggers();

    this.world = new World(this);
    this.scheduler = new Scheduler(this);

    // Missing notifications and response timeouts are thrown from timers,
    // so they land here: they must fail the run, not exit with code 0.
    process.on('uncaughtException', err => {
      if (this.stopped) {
        return;
      }

      this.failed = true;
      this.log('error', err.stack);
      this.report('error', {
        message: err.message,
        stack: err.stack
      });

      if (this.config.scheduler.dieOnError) {
        this.end(1);
      }
    });

    process.on('SIGINT', () => this.end(0, 0));
  }

  init () {
    return this.world.init();
  }

  /**
   * Gives the expectations armed during the last seconds of the run the time
   * to be met or to fail: exiting as soon as the scheduler stops would cancel
   * them (see Client.abortAll).
   *
   * @returns {Promise}
   */
  drain () {
    if (this.stopped) {
      return Bluebird.resolve();
    }

    const delay = this.config.notifications.timeout + 1000;
    this.log('info', `waiting ${delay}ms for pending notifications and responses...`);

    return Bluebird.delay(delay);
  }

  end (code = 0, keepRunningFor = this.config.scheduler.waitBeforeExiting * 1000) {
    if (code !== 0) {
      this.failed = true;
    }

    this.scheduler.stop();

    for (const client of this.world.clients) {
      client.abortAll();
    }

    if (this.world.stats.notifications.count) {
      this.world.stats.notifications.average = this.world.stats.notifications.time / this.world.stats.notifications.count;
    }

    for (const c of Object.keys(this.world.stats.requests.controllers)) {
      for (const a of Object.keys(this.world.stats.requests.controllers[c])) {
        const action = this.world.stats.requests.controllers[c][a];

        if (action.count) {
          action.average = action.time / action.count;
          action.sigma = Math.sqrt(action.timeSquare / action.count - action.average * action.average);
          delete action.timeSquare;
        }
      }
    }

    if (!this.stopped) {
      // Excludes the drain delay, during which no request is sent.
      const duration = (this.world.stats.ended || Date.now()) - this.world.stats.started;

      this.log('info', util.inspect(this.world.stats, {depth: 5}));
      this.log('info', `duration: ${duration}ms`);
      this.log('info', `rpm: ${Math.round(this.world.stats.requests.total / duration * 60 * 1000)} (target: ${this.config.scheduler.rpm})`);
      this.log('info', 'SEED: ' + this.seed);
      this.log('info', `result: ${this.failed ? 'FAILED' : 'passed'}`);
    }
    this.stopped = true;

    // The code is read at exit time: a failure detected while waiting still
    // counts.
    return Bluebird.delay(keepRunningFor)
      .then(() => process.exit(this.failed ? 1 : 0));
  }

  log (level, message, ...args) {
    return this._log('out', level, message, ...args);
  }

  trace (whois, message) {
    return this.log('verbose', `${Date.now()}:${this.world.padRight(whois, 24)} ${message}`);
  }

  report (level, message, ...args) {
    return this._log('report', level, message, ...args);
  }

  _initLoggers () {
    this._loggers = {};

    for (const type of ['out', 'report']) {
      const conf = Object.assign({}, this.config.logs[type]);
      let Transport;

      if (conf.transport === 'file') {
        Transport = winston.transports.File;
      }
      else if (conf.transport === 'elasticsearch') {
        Transport = WinstonElasticsearchTransport;
      }
      else {
        // default = console
        Transport = winston.transports.Console;
      }

      delete conf.transport;

      this._loggers[type] = winston.createLogger({transports: [new Transport(conf)]});
    }
  }

  _log (type, level, message, ...args) {
    if ((args === undefined || args.length === 0)
        && ['error', 'warn', 'info', 'verbose', 'debug', 'silly'].indexOf(level) === -1) {
      if (message === undefined) {
        args = [];
      }
      else if (Array.isArray(message)) {
        args = message;
      }
      else {
        args = [message];
      }

      message = level;
      level = 'info';
    }

    return this._loggers[type].log(level, message, ...args);
  }

}

module.exports = Suite;

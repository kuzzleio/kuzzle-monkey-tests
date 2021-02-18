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

    process.on('uncaughtException', err => {
      if (this.stopped) {
        return;
      }

      this.log('error', err.stack);
      this.report('error', {
        message: err.message,
        stack: err.stack
      });

      if (this.config.scheduler.dieOnError) {
        this.end();
      }
    });

    process.on('SIGINT', () => this.end(0, 0));
  }

  init () {
    return this.world.init();
  }

  end (code = 0, keepRunningFor = this.config.scheduler.waitBeforeExiting * 1000) {
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
      this.log(util.inspect(this.world.stats, {depth: 5}));
      this.log(`duration: ${Date.now() - this.world.stats.started}ms`);
      this.log('rpm: ' + this.world.stats.requests.total / (Date.now() - this.world.stats.started) * 60 * 1000);
      this.log('\n\nseed: ' + this.seed);
    }
    this.stopped = true;

    return Bluebird.delay(keepRunningFor)
      .then(() => process.exit(code));
  }

  log (level, message, ...args) {
    return this._log('out', level, message, ...args);
  }

  trace (whois, message) {
    return this.log(`${Date.now()}:${this.world.padRight(whois, 24)} ${message}`);
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

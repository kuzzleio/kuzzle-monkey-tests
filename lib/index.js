require('reify');

const
  config = require('./config'),
  Random = require('random-js'),
  util = require('util'),
  Scheduler = require('./scheduler'),
  winston = require('winston'),
  WinstonElasticsearchTransport = require('winston-elasticsearch'),
  World = require('./world');

class Suite {

  constructor (params) {
    this.config = config;

    const opts = Object.assign({}, params);
    if (opts.clients && opts.clients.number) {
      this.config.clients.number = opts.clients.number;
    }

    if (process.env.SEED) {
      this.seed = process.env.SEED;
    }
    else {
      this.seed = Math.abs(Random.engines.mt19937().autoSeed()());
    }
    this.rand = new Random(Random.engines.mt19937().seed(this.seed));

    this._initLoggers();

    this.world = new World(this);
    this.scheduler = new Scheduler(this);

    process.on('uncaughtException', err => {
      this.log('error', err);
      this.report('error', {
        message: err.message,
        stack: err.stack
      });

      if (this.config.scheduler.dieOnError) {
        this.end();
      }
    });

    process.on('SIGINT', () => this.end());
  }

  init () {
    return this.world.init();
  }

  end (code = 0) {
    const e = new Error();
    console.log(e);
    this.log('\n');

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

    this.log(util.inspect(this.world.stats, {depth: 5}));
    this.log(`duration: ${Date.now() - this.world.stats.started}ms`);
    this.log('rpm: ' + this.world.stats.requests.total / (Date.now() - this.world.stats.started) * 60 * 1000);
    this.log('\n\nseed: ' + this.seed);

    process.exit(code);
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

      this._loggers[type] = new (winston.Logger)({transports: [new Transport(conf)]});
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

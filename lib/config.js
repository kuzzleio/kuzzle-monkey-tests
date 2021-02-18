'use strict';

const autoParse = require('auto-parse');
const rc = require('rc');

module.exports = autoParse(rc('ktests', {
  clients: {
    number: 50,
    websocket: {
      address: 'ws://localhost:7512',
      options: {
        perMessageDeflate: false
      }
    },
  },
  documents: {
    number: 5000
  },
  kuzzle: {
    cluster: true
  },
  logs: {
    out: {
      level: 'info',
      showLevel: false,
      silent: false,
      timestamp: false,
      transport: 'console',
    },
    report: {
      filename: './logs/report.log',
      json: true,
      level: 'debug',
      logstash: true,
      maxsize: 104857600,
      prettyPrint: false,
      showLevel: true,
      transport: 'file',
      zippedArchive: true,
    }
  },
  notifications: {
    timeout: 10000
  },
  scheduler: {
    dieOnError: true,
    // suite test duration in s. set to -1 to run indefinitely
    duration: 180,
    // # of expected request / minute
    rpm: 8000,
    // shoot in average every x ms
    shootIntervalMean: 5,
    // whether the suite should continue running or not if an error is detected
    waitBeforeExiting: 0,
  },
  subscriptions: {
    historyCheckMaxDelay: 15000,
    // max number or clauses in compound filters (and, or, etc.)
    maxCompoundFilters: 3,
    // maximum depth level of subscriptions filters
    maxDepth: 3,
    number: 1000,
  }
}));

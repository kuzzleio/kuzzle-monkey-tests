const
  autoParse = require('auto-parse'),
  rc = require('rc');

module.exports = autoParse(rc('ktests', {
  clients: {
    websocket: {
      address: 'ws://localhost:7512',
      options: {
        perMessageDeflate: false
      }
    },
    number: 50
  },
  documents: {
    number: 5000
  },
  kuzzle: {
    cluster: true
  },
  logs: {
    out: {
      transport: 'console',
      level: 'info',
      showLevel: false,
      timestamp: false
    },
    report: {
      transport: 'file',
      filename: './logs/report.log',
      level: 'debug',
      json: true,
      prettyPrint: false,
      logstash: true,
      showLevel: true,
      maxsize: 104857600,
      zippedArchive: true
    }
  },
  notifications: {
    timeout: 10000
  },
  scheduler: {
    // suite test duration in s. set to -1 to run indefinitely
    duration: 180,
    // shoot in average every x ms
    shootIntervalMean: 5,
    // # of expected request / minute
    rpm: 8000,
    // whether the suite should continue running or not if an error is detected
    dieOnError: true,
    waitBeforeExiting: 0
  },
  subscriptions: {
    // maximum depth level of subscriptions filters
    maxDepth: 3,
    // max number or clauses in compound filters (and, or, etc.)
    maxCompoundFilters: 3,
    number: 1000,
    historyCheckMaxDelay: 15000
  }
}));

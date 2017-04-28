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
    number: 10
  },
  documents: {
    number: 5000
  },
  logs: {
    out: {
      transport: 'console',
      level: 'info',
      showLevel: false,
      timestamp: false
    },
    report: {
      transport: 'console',
      timestamp: true,
      json: true,
      showLevel: true
    }
  },
  notifications: {
    timeout: 25000
  },
  scheduler: {
    // suite test duration in s
    duration: 120,
    // shoot in average every x ms
    shootIntervalMean: 30,
    // # of expected request / minute
    rpm: 300
  },
  subscriptions: {
    // maximum depth level of subscriptions filters
    maxDepth: 2,
    // max number or clauses in compound filters (and, or, etc.)
    maxCompoundFilters: 3,
    number: 1000
  }
}));

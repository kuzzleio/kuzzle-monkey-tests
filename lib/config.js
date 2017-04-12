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
  notifications: {
    timeout: 15000
  },
  scheduler: {
    // suite test duration in s
    duration: 120,
    // shoot in average every x ms
    shootIntervalMean: 100,
    // # of expected request / minute
    rpm: 120
  },
  subscriptions: {
    // maximum depth level of subscriptions filters
    maxDepth: 2,
    // max number or clauses in compound filters (and, or, etc.)
    maxCompoundFilters: 3,
    number: 1000
  }
}));

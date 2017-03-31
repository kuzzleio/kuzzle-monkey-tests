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
    timeout: 5000
  },
  scheduler: {
    // shoot in average every x ms
    shootIntervalMean: 100,
    // # of expected request / minute
    rpm: 120
  },
  subscriptions: {
    maxDepth: 1,
    maxCompoundFilters: 5,
    number: 500
  }
}));

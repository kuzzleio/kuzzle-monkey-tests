const
  protocols = require('./protocols');

class Client {

  constructor (suite, protocol) {
    this._kuzzle = new protocols[protocol].constructor(suite.config.clients.protocols[protocol]);
  }

  init () {
    return this._kuzzle.init();
  }

  /**
   * @param {Test} test
   */
  runTest (test) {
    test.run()
      .then(() => {

      })

  }

}

module.exports = Client;

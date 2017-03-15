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
   *
   * @param {Object} data
   * @return {*}
   */
  send (data) {
    return this._kuzzle.send(data);
  }

}

module.exports = Client;

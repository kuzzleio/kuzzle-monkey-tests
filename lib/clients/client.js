const
  Request = require('./request'),
  uuid = require('uuid');

let
  _suite;

class Client {

  constructor (suite) {
    _suite = suite;

    this.uuid = uuid.v4();
    this._requestIdIncr = 0;
    this._expectedNotifications = {};
  }

  get _suite () {
    return _suite;
  }

  createRequest () {
    return new Request(this, `${this.uuid}-${++this._requestIdIncr}`);
  }

  expectNotification (requestId) {
    this._expectedNotifications[requestId] = setTimeout(() => {
      throw new Error(`timeout: ${this.uuid} did not receive notification ${requestId} in time`);
    }, 5000);
  }

  expectOptionalNotification (requestId) {
    this._expectedNotifications[requestId] = setTimeout(() => {
      delete this._expectedNotifications[requestId];
    }, 5000);
  }


  init () {
    throw new Error('not implemented');
  }

  _send () {
    throw new Error('not implemented');
  }

}

module.exports = Client;

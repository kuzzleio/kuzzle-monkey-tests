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

  /**
   *
   * @param {Request} request
   * @param {Subscription} subscription
   */
  expectNotification (request, subscription) {
    this._suite.world.requests[request.id] = subscription;

    this._expectedNotifications[request.id] = setTimeout(() => {
      throw new Error(`timeout: ${this.uuid} did not receive notification ${request.id} in time\n`
        + 'request:' + JSON.stringify(request.request, undefined, 2) + '\n'
        + 'filter:' + JSON.stringify(subscription.filter.filter(), undefined, 2));
    }, 10000);
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

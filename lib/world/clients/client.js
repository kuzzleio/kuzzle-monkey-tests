const
  Request = require('./request'),
  dockerNames = require('docker-names');

let
  _suite;

class Client {

  constructor (suite) {
    _suite = suite;

    this.uuid = suite.world.getId(Client);
    this._requestIdIncr = 0;

    this._expectedNotifications = new Map();
    this._subscriptions = new Map();
  }

  get _suite () {
    return _suite;
  }

  addSubscription (subscription) {
    this._subscriptions.set(subscription, {
      state: 'init'
    });
  }

  createRequest (data) {
    const id = `${this.uuid}-${++this._requestIdIncr}`;

    data.requestId = id;

    const request = new Request(this, id, data);
    this._suite.world.requests.set(request.id, request);

    return request;
  }

  /**
   *
   * @param {Request} request
   * @param {Subscription} subscription
   */
  expectNotification (request, subscription) {
    console.log(`${Date.now()}:${this._suite.world.padRight(this.uuid, 24)} /expectNotification/${request.id}`);

    if (this._expectedNotifications.has(request.id)) {
      this._expectedNotifications.get(request.id).count++;
      return;
    }

    let timer;

    if (subscription.state === 'ready') {
      timer = setTimeout(() => {
        throw new Error(`timeout: ${this.uuid} did not receive notification ${request.id} in time\n`
          + 'data:' + JSON.stringify(request.data, undefined, 2) + '\n'
          + 'filter:' + JSON.stringify(subscription.filter.filter(), undefined, 2)
        );
      }, this._suite.config.notifications.timeout);
    }
    else {
      timer = setTimeout(() => {
        if (this._expectedNotifications.has(request.id)) {
          console.log(`${Date.now()}:${this._suite.world.padRight(this.uuid, 24)} /expectNotification/timeout/optional/${request.id}`);
          this._expectedNotifications.delete(request.id);
        }
      }, this._suite.config.notifications.timeout);
    }

    this._expectedNotifications.set(request.id, {
      count: 1,
      timer
    });

  }

  getOneSubscription () {
    return this._suite.rand.pick([...this._subscriptions.keys()]);
  }

  receiveNotification (data) {

    console.log(`${Date.now()}:${this._suite.world.padRight(this.uuid, 24)} /notif/${data.requestId}`);

    const request = this._suite.world.requests.get(data.requestId);

    if (!this._isNotificationExpected(data)) {
      throw new Error(`[${this.uuid}] unexpected notification received:`
        + '\nnotification: ' + JSON.stringify(data, undefined, 2)
      );
    }

    const expected = this._expectedNotifications.get(data.requestId);

    if (!expected) {
      return;
    }

    expected.count--;

    if (expected.count === 0) {
      clearTimeout(expected.timer);

      this._expectedNotifications.delete(data.requestId);
    }

  }

  updateSubscriptionState (subscription, state) {
    this._subscriptions.get(subscription).state = state;
  }

  init () {
    throw new Error('not implemented');
  }

  /**
   * @param {Object} notification
   * @private
   */
  _isNotificationExpected (notification) {
    // document notification
    if ( notification.controller === 'realtime' && notification.action === 'publish'
      || notification.controller === 'document') {
      const doc = this._suite.world.documents.get(notification.result._source._id);

      for (let sub of this._subscriptions.keys()) {
        console.dir(sub.filter.filter(), {depth: null});
        console.log(sub.filter.matches());
        if (sub.filter.matches().has(doc)) {
          return true;
        }
      }

      return false;
    }

    throw new Error('Non-document notification received - not implemented'
      + JSON.stringify(notification, undefined, 2)
    );
  }

  _send () {
    throw new Error('not implemented');
  }

}

module.exports = Client;

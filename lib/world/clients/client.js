const
  Request = require('./request');

let
  _suite;

class Client {

  constructor (suite) {
    _suite = suite;

    this.uuid = suite.world.getId(Client);
    this._requestIdIncr = 0;

    this._expectedNotifications = new Map();
    this._pendingRequests = new Map();
    this._subscriptions = new Map();
  }

  get _suite () {
    return _suite;
  }

  addSubscription (subscription) {
    subscription.pendingClients.add(this);

    this._subscriptions.set(subscription, {
      state: 'init'
    });

    this._suite.world.subscriptionsUnconfirmed.add(subscription);
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

  /**
   *
   * @param {Request} request
   * @param {Function} resolve - Optional. Promise resolve function to call on success.
   */
  expectResponse (request, resolve) {
    const timer = setTimeout(() => {
      throw new Error(`${this.uuid} Timeout. Did not receive response ${request.id} in time`
        + '\ndata:' + JSON.stringify(request.data, undefined, 2)
      );
    }, this._suite.config.notifications.timeout);

    this._pendingRequests.set(request.id, {
      'resolve': resolve,
      timer
    });
  }

  getOneSubscription () {
    return this._suite.rand.pick([...this._subscriptions.keys()]);
  }

  receiveNotification (data) {

    console.log(`${Date.now()}:${this._suite.world.padRight(this.uuid, 24)} /notif/${data.requestId}`);

    if (data.error) {
      throw new Error('error received: \n'
        + JSON.stringify(data, undefined, 2));
    }

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

  subscribeToWorld (subscription) {
    if (!this._suite.world.rooms.has(subscription.index)) {
      this._suite.world.rooms.set(subscription.index, new Map());
    }
    if (!this._suite.world.rooms.get(subscription.index).has(subscription.collection)) {
      this._suite.world.rooms.get(subscription.index).set(subscription.collection, new Map());
    }
    if (!this._suite.world.rooms.get(subscription.index).get(subscription.collection).has(subscription.roomId)) {
      this._suite.world.rooms.get(subscription.index).get(subscription.collection).set(subscription.roomId, {
        clients: new Set()
      });
    }

    this._suite.world.rooms.get(subscription.index).get(subscription.collection).get(subscription.roomId).clients.add(this);
  }

  updateSubscriptionState (subscription, state) {
    this._subscriptions.get(subscription).state = state;

    if (state === 'ready') {
      subscription.clients.add(this);
      subscription.pendingClients.delete(this);

      this.subscribeToWorld(subscription);
    }

    console.log(`${Date.now()}:${this._suite.world.padRight(this.uuid, 24)} /subscribed/${[...this._subscriptions.keys()].map(sub => sub.roomId).join('/')}`);
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

      if (!notification.result || !notification.result._source || !notification.result._source._id) {
        throw new Error(`${this.uuid} invalid document notification received:\n`
          + JSON.stringify(notification, undefined, 2));
      }

      const doc = this._suite.world.documents.get(notification.result._source._id);

      for (let sub of this._subscriptions.keys()) {
        if (sub.filter.matches().has(doc)) {
          return true;
        }
      }

      for (let sub of this._subscriptions.keys()) {
        console.dir(sub.filter.filter(), {depth: null});
      }

      return false;
    }

    throw new Error('Non-document notification received - not implemented'
      + JSON.stringify(notification, undefined, 2)
    );
  }

  _isResponse (data) {
    return (
         this._pendingRequests.has(data.requestId)
      && data.scope === undefined
      && data.state === undefined);
  }

  _onMessage(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    if (this._isResponse(data)) {
      // direct ack response from a data emitted by current client
      const request = this._pendingRequests.get(data.requestId);

      if (request.resolve instanceof Function) {
        request.resolve(data);
      }
      clearTimeout(request.timer);

      this._pendingRequests.delete(data.requestId);
    }
    else {
      // notification
      this.receiveNotification(data);
    }
  }


  send () {
    throw new Error('not implemented');
  }

}

module.exports = Client;

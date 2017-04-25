const
  Request = require('./request');

let
  _suite;

class Client {

  constructor (suite) {
    _suite = suite;

    this.uuid = suite.world.getId(Client);
    this._requestIdIncr = 0;

    /** @type {Map.<string, Object>} */
    this._expectedNotifications = new Map();
    this._pendingRequests = new Map();

    this.subscriptions = new Set();
  }

  get _suite () {
    return _suite;
  }

  get _world () {
    return this._suite.world;
  }

  addSubscription (subscription) {
    this.subscriptions.add(subscription);
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
   * @param {Room} room
   */
  expectNotification (request, room) {
    const expectationId = `${room.id}-${request.id}`;

    this._suite.trace(this.uuid, `/expectNotification/${expectationId}`);

    if (!this._expectedNotifications.has(expectationId)) {
      this._expectedNotifications.set(expectationId, setTimeout(() => {
        const subs = [];

        for (const sub of room.subscriptions) {
          if (this.subscriptions.has(sub)) {
            subs.push({
              index: sub.index,
              collection: sub.collection,
              filter: sub.filter.filter()
            });
          }
        }

        throw new Error(`timeout: ${this.uuid} did not receive notification ${request.id} for room ${room.id} in time\n`
          + '\ndata:' + JSON.stringify(request.data, undefined, 2)
          + '\nfilters: ' + JSON.stringify(subs, undefined, 2)
        );
      }, this._suite.config.notifications.timeout));
    }
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
    return this._suite.rand.pick([...this.subscriptions]);
  }

  receiveNotification (data) {

    this._suite.trace(this.uuid, `/notif/${data.requestId}`);

    if (data.error) {
      throw new Error('error received: \n'
        + JSON.stringify(data, undefined, 2));
    }

    if (!this._isNotificationExpected(data)) {
      throw new Error(`[${this.uuid}] unexpected notification received:`
        + '\nnotification: ' + JSON.stringify(data, undefined, 2)
      );
    }

    this._world.stats.notifications.time += Date.now() - data.timestamp;
    this._world.stats.notifications.count++;

    let roomId = data.roomId;
    if (roomId === 'Multiple rooms') {
      roomId = data.room.split('-')[0];
    }
    const expectationId = `${roomId}-${data.requestId}`;

    if (this._expectedNotifications.has(expectationId)) {
      clearTimeout(this._expectedNotifications.get(expectationId));
      this._expectedNotifications.delete(expectationId);
    }
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

      const doc = this._suite.world.getDocument(notification.result._source._id);

      for (const sub of this.subscriptions) {
        if (sub.matches().has(doc)) {
          return true;
        }
      }

      for (const sub of this.subscriptions) {
        console.dir({
          index: sub.index,
          collection: sub.collection,
          filter: sub.filter.filter()
        }, {depth: null});
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
      try {
        data = JSON.parse(data);
      }
      catch (e) {
        this._suite.log('error', `data: ${JSON.stringify(data)}`);
        this._suite.log('error', e);
        process.exit(1);
      }
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

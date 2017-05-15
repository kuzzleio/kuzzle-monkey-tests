const
  Request = require('./request');

let
  _suite;

class Client {

  constructor (suite) {
    _suite = suite;

    this.uuid = suite.world.getId(Client);
    if (this.uuid === undefined) {
      throw new Error('toto');
    }
    this._requestIdIncr = 0;

    /** @type {Map.<string, Object>} */
    this._expectedNotifications = new Map();
    this._pendingRequests = new Map();

    this.subscriptions = new Set();

    this.history = [];
  }

  get _suite () {
    return _suite;
  }

  get _world () {
    return this._suite.world;
  }

  addRoom (room) {
    if (!room.clients.confirmed.has(this)) {
      room.clients.unconfirmed.add(this);
    }
  }

  addSubscription (subscription) {
    this.subscriptions.add(subscription);
    this._suite.world.subscriptionsUnconfirmed.add(subscription);
  }

  confirmRoom (room) {
    room.clients.unconfirmed.delete(this);
    room.clients.confirmed.add(this);
  }

  createRequest (data) {
    const id = `${this.uuid}-${++this._requestIdIncr}`;

    data.requestId = id;

    const request = new Request(this, id, data);
    this.history.push(request);

    return request;
  }

  /**
   *
   * @param {Request} request
   * @param {Room} room
   */
  expectNotification (request, room) {
    const expectationId = `${room.id}-${request.id}`;

    // this._suite.trace(this.uuid, `/expectNotification/${expectationId}`);

    if (!this._expectedNotifications.has(expectationId)) {
      this._expectedNotifications.set(expectationId, setTimeout(() => {
        const subs = [];

        if (this._hasJustUnsubscribed(room)) {
          return;
        }

        for (const sub of room.subscriptions) {
          if (this.subscriptions.has(sub)) {
            subs.push({
              index: sub.index,
              collection: sub.collection,
              filter: sub.filter.filter(),
              roomId: sub.roomId
            });
          }
        }

        throw new Error(`timeout: ${this.uuid} did not receive notification ${request.id} for room ${room.id} in time\n`
          + '\ndata:' + JSON.stringify(request.data, undefined, 2)
          + '\nmatching subs: ' + JSON.stringify(subs, undefined, 2)
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
    const expectationId = `${data.room.split('-')[0]}-${data.requestId}`;

    // this._suite.trace(this.uuid, `/notif/${expectationId}`);

    if (data.error) {
      throw new Error('error received: \n'
        + JSON.stringify(data, undefined, 2));
    }

    if (!this._isNotificationExpected(data)) {
      const room = this._world.rooms.get(data.room.split('-')[0]);
      console.log(room);
      for (const t in room.clients) {
        console.log(t, [...room.clients[t]].map(client => client.uuid));
      }
      throw new Error(`[${this.uuid}] unexpected notification received:`
        + '\nnotification: ' + JSON.stringify(data, undefined, 2)
      );
    }

    this._world.stats.notifications.time += Date.now() - data.timestamp;
    this._world.stats.notifications.count++;


    if (this._expectedNotifications.has(expectationId)) {
      clearTimeout(this._expectedNotifications.get(expectationId));
      this._expectedNotifications.delete(expectationId);
    }
  }

  init () {
    throw new Error('not implemented');
  }

  unsubscribe (room) {
    room.clients.unconfirmed.delete(this);
    room.clients.confirmed.delete(this);
    room.clients.deleting.delete(this);
    room.clients.deleted.add(this);

    for (const sub of room.subscriptions) {
      this.subscriptions.delete(sub);
      sub.clients.delete(this);
    }

    for (const expectationId of this._expectedNotifications.keys()) {
      if (expectationId.startsWith(room.id + '-')) {
        clearTimeout(this._expectedNotifications.get(expectationId));
        this._expectedNotifications.delete(expectationId);
      }
    }
  }

  /**
   * @param {Object} notification
   * @private
   */
  _isNotificationExpected (notification) {
    const isDocumentNotification = notification.controller === 'realtime'
      && notification.action === 'publish'
      || notification.controller === 'document';

    if ( isDocumentNotification
      && ( !notification.result
        || !notification.result._source
        || !notification.result._source._id
      )) {
      throw new Error(`${this.uuid} invalid document notification received:\n`
        + JSON.stringify(notification, undefined, 2));
    }

    // ok if we subscribed to it
    const
      roomId = notification.room.split('-')[0],
      room = this._world.rooms.get(roomId);

    if (!room) {
      // could not find the room.
      // check if we have just subscribed to a matching document.
      const isOK = this._isNotificationMatchingSubscription(notification, isDocumentNotification);

      if (isOK) {
        return true;
      }

      throw new Error(`${this.uuid} could not find room ${roomId}\n`
        + JSON.stringify(notification, undefined, 2));
    }
    if (room.clients.confirmed.has(this)) {
      return true;
    }
    if (room.clients.unconfirmed.has(this)) {
      return true;
    }
    if (room.clients.deleting.has(this)) {
      return true;
    }

    if (this._isNotificationMatchingSubscription(notification, isDocumentNotification)) {
      return true;
    }

    // tricky case where we can have subscribed and unsubscribed in a short delay
    if (this._hasJustUnsubscribed(room)) {
      return true;
    }

    for (const sub of this.subscriptions) {
      if (sub.index === notification.index && sub.collection === notification.collection) {
        console.dir({
          index: sub.index,
          collection: sub.collection,
          roomId: sub.roomId,
          filter: sub.filter.filter()
        }, {depth: null});
      }
    }

    return false;
  }

  _isNotificationMatchingSubscription (notification, isDocumentNotification) {
    if (isDocumentNotification) {
      const doc = this._world.getDocument(notification.result._source._id);
      for (const subscription of this.subscriptions) {
        if (subscription.matches().has(doc)) {
          return true;
        }
      }
    }

    return false;
  }

  _hasJustSubscribed (room, since = 2000) {
    let i = this.history.length;
    while (i--) {
      const request = this.history[i];
      if (request.timestamp < Date.now() - since) {
        // obsolete - exit
        break;
      }

      const hasJoined = request.data.action === 'join' && request.data.body.roomId === room.id;
      let hasSubscribed = false;

      if (request.response) {
        hasSubscribed = request.data.action === 'subscribe' && request.response.result.roomId === room.id;
      }
      if (request.data.controller === 'realtime' && (hasJoined || hasSubscribed)) {
        return true;
      }

    }

    return false;
  }

  _hasJustUnsubscribed (room, since = 2000) {
    let i = this.history.length;
    while (i--) {
      const request = this.history[i];

      if (request.timestamp < Date.now() - since) {
        // obsolete - exit
        break;
      }

      if (request.data.controller === 'realtime'
        && request.data.action === 'unsubscribe'
        && request.data.body.roomId === room.id) {
        return true;
      }
    }

    return false;
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
        throw e;
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

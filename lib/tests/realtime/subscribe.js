'use strict';

const Test = require('../test');

class Subscribe extends Test {
  async _run () {
    const
      client = this._suite.world.getClient(),
      subscription = this._suite.world.getSubscription(),
      request = client.createRequest({
        action: 'subscribe',
        body: subscription.filter.filter(),
        collection: subscription.collection,
        controller: 'realtime',
        index: subscription.index,
        volatile: { subscriptionId: subscription.id },
      });

    client.addSubscription(subscription);

    if (subscription.roomId) {
      client.addRoom(subscription.room);
    }

    const response = await request.send();
    subscription.roomId = response.result.roomId;
    client.confirmRoom(subscription.room);

    this._suite.trace(subscription.roomId, `Client ${client.uuid} subscribed`);
    this._suite.trace(
      subscription.roomId,
      `/room/clients/${[...subscription.room.clients.confirmed].map(c => c.uuid).join('/')}`
    );
  }
}

module.exports = Subscribe;

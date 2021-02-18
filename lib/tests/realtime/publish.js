'use strict';

const Test = require('../test');

class Publish extends Test {
  _run () {
    const client = this._suite.world.getClient();
    const doc = this._suite.world.getDocument();
    const request = client.createRequest({
      action: 'publish',
      body: doc.serialize(),
      collection: doc.collection,
      controller: 'realtime',
      index: doc.index,
    });

    // expectations
    // All clients which subscribed to the matching subscriptions should receive
    // a notification in time
    for (const subscription of doc.subscriptions) {
      if (subscription.roomId) {
        for (const confirmedClient of subscription.room.clients.confirmed) {
          if (!confirmedClient._hasJustSubscribed(subscription.room, 3000)) {
            confirmedClient.expectNotification(request, subscription.room);
          }
        }
      }
    }

    return request.send();
  }
}

module.exports = Publish;

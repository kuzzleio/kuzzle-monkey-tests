const
  Test = require('../test');

class Subscribe extends Test {

  _run () {
    const
      client = this._suite.world.getClient(),
      subscription = this._suite.world.getSubscription(),
      request = client.createRequest({
        controller: 'realtime',
        action: 'subscribe',
        index: subscription.index,
        collection: subscription.collection,
        body: subscription.filter.filter(),
        volatile: { subscriptionId: subscription.id }
      });

    client.addSubscription(subscription);

    if (subscription.roomId) {
      client.addRoom(subscription.room);
    }

    return request.send()
      .then(response => {
        subscription.roomId = response.result.roomId;
        client.confirmRoom(subscription.room);

        this._suite.trace(subscription.roomId, `Client ${client.uuid} subscribed`);
        this._suite.trace(
          subscription.roomId,
          `/room/clients/${[...subscription.room.clients.confirmed].map(c => c.uuid).join('/')}`
        );
      });
  }

}

module.exports = Subscribe;

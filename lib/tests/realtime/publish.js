const
  Test = require('../test');

class Publish extends Test {

  run () {
    const
      client = this._suite.world.getClient(),
      doc = this._suite.world.getDocument(),
      request = client.createRequest({
        controller: 'realtime',
        action: 'publish',
        index: doc.index,
        collection: doc.collection,
        body: doc.serialize()
      });

    // expectations
    // All clients which subscribed to the matching subscriptions should receive
    // a notification in time
    for (let subscription of doc.subscriptions) {
      if (subscription.roomId) {
        for (let client of subscription.room.clients) {
          client.expectNotification(request, subscription.room);
        }
      }
    }

    return request.send();
  }

}

module.exports = Publish;

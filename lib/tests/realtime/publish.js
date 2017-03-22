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
        index: 'index',
        collection: 'collection',
        body: doc.serialize()
      });

    // expectations
    // All clients which subscribed to the matching subscriptions should receive
    // a notification in time
    for (let subscription of doc.subscriptions) {
      request.subscriptions.add(subscription);

      for (let c of subscription.clients) {
        c.expectNotification(request, subscription);
      }
    }

    return request.send();
  }

}

module.exports = Publish;

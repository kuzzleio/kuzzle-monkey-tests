const
  Test = require('../test');

class Publish extends Test {

  run () {
    const
      client = this._suite.world.getClient(),
      doc = this._suite.world.getDocument(),
      request = client.createRequest();

    // expectations
    for (let subscription of doc.subscriptions) {
      for (let c of subscription.clients) {
        c.expectNotification(request, subscription);
      }
    }

    return request.send({
      controller: 'realtime',
      action: 'publish',
      index: 'index',
      collection: 'collection',
      body: doc.serialize()
    })
  }

}

module.exports = Publish;

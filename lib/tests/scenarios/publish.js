const
  Promise = require('bluebird'),
  Scenario = require('./scenario');

class Publish extends Scenario {

  run () {
    const
      client = this._suite.getClient(),
      doc = this._suite.world.getDocument(),
      request = client.createRequest();

    for (let subscription of doc.subscriptions) {
      for (let c of subscription.clients) {
        c.expectNotification(request.id);
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

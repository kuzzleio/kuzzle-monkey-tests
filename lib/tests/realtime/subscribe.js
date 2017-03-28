const
  Test = require('../test');

class Subscribe extends Test {

  run () {
    const
      client = this._suite.world.getClient(),
      subscription = this._suite.world.getSubscription(),
      index = 'index',
      collection = 'collection',
      request = client.createRequest({
        controller: 'realtime',
        action: 'subscribe',
        index,
        collection,
        body: subscription.filter.filter()
      });

    client.addSubscription(subscription);

    return request.send()
      .then(response => {
        if (response.error) {
          throw new Error('Error received while subscribing:\n'
            + JSON.stringify(response, undefined, 2));
        }
        subscription.roomId = response.result.roomId;

        client.updateSubscriptionState(subscription, 'ready');
        console.log(`${Date.now()}:${this._suite.world.padRight(subscription.roomId, 24)} /clients/${[...subscription.clients].map(client => client.uuid).join('/')}`)
      });
  }

}

module.exports = Subscribe;

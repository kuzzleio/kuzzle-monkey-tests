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

    subscription.addClient(client);
    client.addSubscription(subscription);
    request.subscriptions.add(subscription);

    return request.send()
      .then(response => {
        subscription.roomId = response.result.roomId;
      });
  }

}

module.exports = Subscribe;

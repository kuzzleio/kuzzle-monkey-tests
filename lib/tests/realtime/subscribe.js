const
  Test = require('../test');

class Subscribe extends Test {

  constructor (suite) {
    super(suite);
  }

  run () {
    const
      client = this._suite.world.getClient(),
      subscription = this._suite.world.getSubscription(),
      index = 'index',
      collection = 'collection',
      request = client.createRequest();

    subscription.addClient(client);

    return request.send({
      controller: 'realtime',
      action: 'subscribe',
      index,
      collection,
      body: subscription.filter.filter()
    })
      .then(response => {
        const req = client.createRequest();

        // client can receive a notification if it subscribed to a room that would match
        client.expectOptionalNotification(req.id);

        return req.send({
          controller: 'realtime',
          action: 'join',
          index,
          collection,
          body: {
            roomId: response.result.roomId
          }
        })
      });
  }

}

module.exports = Subscribe;

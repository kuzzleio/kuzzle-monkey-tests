const
  Promise = require('bluebird'),
  should = require('should/as-function'),
  Test = require('../test');

class Count extends Test {

  run () {
    const
      client = this._suite.world.getClient(),
      subscription = client.getOneSubscription();

    if (subscription === undefined) {
      // client has not subscribed
      return Promise.resolve();
    }
    if (subscription.roomId === null) {
      // subscription has not been updated with its room id yet
      return Promise.resolve();
    }

    const request = client.createRequest({
        controller: 'realtime',
        action: 'count',
        body: {
          roomId: subscription.roomId
        }
      });

    return request.send()
      .then(response => {
        should(response.result.count)
          .be.eql(subscription.clients.size);
      });
  }

}

module.exports = Count;

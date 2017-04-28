const
  Promise = require('bluebird'),
  should = require('should/as-function'),
  Test = require('../test');

class Count extends Test {

  _run () {
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

    let
      expected = 0,
      possible = 0;

    return request.send()
      .then(response => {
        if (response.error) {
          throw response.error;
        }

        const
          room = this._world.rooms.get(subscription.roomId),
          expected = room.clients.confirmed.size;

        possible = room.clients.unconfirmed.size;
        for (let sub of this._world.subscriptionsUnconfirmed) {
          possible += sub.pendingClients.size;
        }

        should(response.result.count)
          .be.aboveOrEqual(expected)
          .be.belowOrEqual(expected + possible);
      });
  }

}

module.exports = Count;

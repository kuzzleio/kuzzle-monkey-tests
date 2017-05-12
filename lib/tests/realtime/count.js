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
    const room = this._world.rooms.get(subscription.roomId);

    return request.send()
      .then(response => {
        if (response.error) {
          throw response.error;
        }

        const
          expected = room.clients.confirmed.size,
          possible = room.clients.deleting.size;

        should(response.result.count)
          .be.aboveOrEqual(expected)
          .be.belowOrEqual(expected + possible);
      })
      .catch(error => {
        if (error.status === 404 && room.clients.confirmed.size === 0) {
          // 404 & no confirmed client... looks normal
          return;
        }
        console.error({
          confirmed: [...room.clients.confirmed].map(client => client.uuid),
          deleting: [...room.clients.deleting].map(client => client.uuid),
          unconfirmed: [...room.clients.unconfirmed].map(client => client.uuid)
        });

        throw error;
      });
  }

}

module.exports = Count;

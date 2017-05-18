const
  Promise = require('bluebird'),
  should = require('should/as-function'),
  RoomCountTest = require('./_roomCount');

class Count extends RoomCountTest {

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

    return request.send()
      .then(response => this._validRoomCount(request, subscription.roomId, response.result.count))
      .catch(error => {
        if (error.status === 404) {
          return this._validRoomCount(request, subscription.roomId, 0);
        }

        throw error;
      });
  }

}

module.exports = Count;

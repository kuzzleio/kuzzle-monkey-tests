const
  Bluebird = require('bluebird'),
  RoomCountTest = require('./_roomCount');

class Count extends RoomCountTest {

  _run () {
    const
      client = this._suite.world.getClient(),
      room = this._world.getRoom();

    if (!room) {
      return Bluebird.resolve();
    }

    const request = client.createRequest({
      controller: 'realtime',
      action: 'count',
      body: {
        roomId: room.id
      }
    });

    return request.send()
      .then(response => this._validRoomCount(request, room.id, response.result.count))
      .catch(error => {
        if (error.status === 404) {
          return this._validRoomCount(request, room.id, 0)
            .catch(e => {
              console.error(request.body);
              throw e;
            });
        }

        throw error;
      });
  }

}

module.exports = Count;

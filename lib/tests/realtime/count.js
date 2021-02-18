'use strict';

const RoomCountTest = require('./_roomCount');

class Count extends RoomCountTest {
  async _run () {
    const client = this._suite.world.getClient();
    const room = this._world.getRoom();

    if (!room) {
      return;
    }

    const request = client.createRequest({
      action: 'count',
      body: {
        roomId: room.id,
      },
      controller: 'realtime',
    });

    try {
      const response = await request.send();
      await this._validRoomCount(request, room.id, response.result.count);
    }
    catch(error) {
      if (error.status === 404) {
        return this._validRoomCount(request, room.id, 0)
          .catch(e => {
            console.error(request.body);
            throw e;
          });
      }

      throw error;
    }
  }
}

module.exports = Count;

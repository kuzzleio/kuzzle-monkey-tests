'use strict';

const Bluebird = require('bluebird');
const RoomCountTest = require('./_roomCount');

class List extends RoomCountTest {
  async _run () {
    const client = this._world.getClient();
    const request = client.createRequest({
      action: 'list',
      controller: 'realtime',
    });

    const response = await request.send();
    const promises = [];

    for (const index of Object.keys(response.result)) {
      for (const collection of Object.keys(response.result[index])) {
        for (const roomId of Object.keys(response.result[index][collection])) {
          const count = response.result[index][collection][roomId];

          promises.push(this._validRoomCount(request, roomId, count));
        }
      }
    }

    return Bluebird.all(promises);
  }
}

module.exports = List;

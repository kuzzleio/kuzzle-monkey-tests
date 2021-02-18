'use strict';

const RoomCountTest = require('./_roomCount');

class Join extends RoomCountTest {
  async _run () {
    if (this._world.rooms.size === 0) {
      return;
    }

    const client = this._world.getClient();
    const room = this._suite.rand.pick([...this._world.rooms.values()]);
    const request = client.createRequest({
      action: 'join',
      body: {
        roomId: room.id,
      },
      controller: 'realtime',
    });

    if (room.clients.confirmed.size === 0) {
      // no client connected to the room - was deleted on server side
      return;
    }

    client.addRoom(room);

    try {
      await request.send();
      client.confirmRoom(room);

      this._suite.trace(room.id, `Client ${client.uuid} joined`);
      this._suite.trace(room.id, `/room/clients/${[...room.clients.confirmed].map(c => c.uuid).join('/')}`);
    }
    catch(error) {
      console.log(error);
      if (error.status === 404) {
        await this._validRoomCount(request, room.id, 0);
        client.unsubscribe(room);
      }

      for (const t in room.clients) {
        if (Object.prototype.hasOwnProperty.call(room.clients, t)) {
          console.log([...room.clients[t]].map(c => c.uuid));
        }
      }

      throw error;
    }
  }
}

module.exports = Join;

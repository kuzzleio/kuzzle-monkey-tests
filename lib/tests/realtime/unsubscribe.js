'use strict';

const RoomCountTest = require('./_roomCount');

class Unsubscribe extends RoomCountTest {
  async _run () {
    const room = this._suite.rand.pick([...this._world.rooms.values()]);

    if (!room || room.clients.confirmed.size === 0) {
      return;
    }

    const client = this._suite.rand.pick([...room.clients.confirmed.values()]);
    const request = client.createRequest({
      action: 'unsubscribe',
      body: {
        roomId: room.id,
      },
      controller: 'realtime',
    });

    room.clients.confirmed.delete(client);
    room.clients.deleting.add(client);

    try {
      await request.send();
      await client.unsubscribe(room);
    }
    catch (error) {
      if ( error.status === 404
        && this._suite.config.kuzzle.cluster
        && client._hasJustSubscribed(room, 1000)
      ) {
        return;
      }

      console.log('from tests/realtime/unsubscribe');
      throw error;
    }

    this._suite.trace(room.id, `Client ${client.uuid} unsubscribed`);
    this._suite.trace(room.id, `/room/clients/${[...room.clients.confirmed].map(c => c.uuid).join('/')}`);
  }

}

module.exports = Unsubscribe;

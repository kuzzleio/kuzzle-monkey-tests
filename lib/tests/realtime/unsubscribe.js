const
  Bluebird = require('bluebird'),
  RoomCountTest = require('./_roomCount');

class Unsubscribe extends RoomCountTest {

  _run () {
    const
      room = this._suite.rand.pick([...this._world.rooms.values()]);

    if (!room) {
      return Bluebird.resolve();
    }

    if (room.clients.confirmed.size === 0) {
      return Bluebird.resolve();
    }

    const
      client = this._suite.rand.pick([...room.clients.confirmed.values()]),
      request = client.createRequest({
        controller: 'realtime',
        action: 'unsubscribe',
        body: {
          roomId: room.id
        }
      });

    room.clients.confirmed.delete(client);
    room.clients.deleting.add(client);

    return request.send()
      .then(() => client.unsubscribe(room))
      .then(() => {
        this._suite.trace(room.id, `Client ${client.uuid} unsubscribed`);
        this._suite.trace(room.id, `/room/clients/${[...room.clients.confirmed].map(c => c.uuid).join('/')}`);
      })
      .catch(error => {
        if (error.status === 404
          && this._suite.config.kuzzle.cluster
          && client._hasJustSubscribed(room, 1000)
        ) {
          return;
        }

        console.log('from tests/realtime/unsubscribe');
        throw error;
      });
  }

}

module.exports = Unsubscribe;

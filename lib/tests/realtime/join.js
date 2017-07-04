const
  Bluebird = require('bluebird'),
  RoomCountTest = require('./_roomCount');

class Join extends RoomCountTest {

  _run () {
    if (this._world.rooms.size === 0) {
      return Bluebird.resolve();
    }

    const
      client = this._world.getClient(),
      room = this._suite.rand.pick([...this._world.rooms.values()]),
      request = client.createRequest({
        controller: 'realtime',
        action: 'join',
        body: {
          roomId: room.id
        }
      });

    if (room.clients.confirmed.size === 0) {
      // no client connected to the room - was deleted on server side
      return Bluebird.resolve();
    }

    client.addRoom(room);

    return request.send()
      .then(() => {
        client.confirmRoom(room);

        this._suite.trace(room.id, `/room/clients/${[...room.clients.confirmed].map(c => c.uuid).join('/')}`);
      })
      .catch(error => {
        console.log(error);
        if (error.status === 404) {
          return this._validRoomCount(request, room.id, 0)
            .then(() => {
              client.unsubscribe(room);
            });
        }

        for (const t in room.clients) {
          if (room.clients.hasOwnProperty(t)) {
            console.log([...room.clients[t]].map(c => c.uuid));
          }
        }

        throw error;
      });
  }

}


module.exports = Join;

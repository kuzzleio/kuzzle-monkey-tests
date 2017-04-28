const
  Bluebird = require('bluebird'),
  Test = require('../test');

class Join extends Test {

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

    client.addRoom(room);

    return request.send()
      .then(response => {
        if (response.error) {
          throw new Error('Error received while subscribing:\n'
            + JSON.stringify(response, undefined, 2));
        }

        client.confirmRoom(room);

        this._suite.trace(room.id, `/room/clients/${[...room.clients.confirmed].map(client => client.uuid).join('/')}`)
      })
      .catch(error => {
        if (error.message.startsWith('No room found for id ') && room.clients.confirmed.size === 0) {
          // room was deleted in the meantime. OK for us.
          this._suite.trace(client.uuid, `/join/error/room ${room.id} not found`);
          client.unsubscribe(room);
          return;
        }

        for (const t in room.clients) {
          console.log([...room.clients[t]].map(client => client.uuid));
        }

        throw error;
      });

  }

}

module.exports = Join;

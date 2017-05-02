const
  Bluebird = require('bluebird'),
  Test = require('../test');

class Unsubscribe extends Test {

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
      .then(() => {
        client.unsubscribe(room);
      });
  }

}

module.exports = Unsubscribe;

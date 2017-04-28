const
  should = require('should/as-function'),
  Test = require('../test');

class List extends Test {

  _run () {
    const
      client = this._world.getClient(),
      request = client.createRequest({
        controller: 'realtime',
        action: 'list'
      });

    return request.send()
      .then(response => {
        for (const index of Object.keys(response.result)) {
          for (const collection of Object.keys(response.result[index])) {
            for (const roomId of Object.keys(response.result[index][collection])) {
              const count = response.result[index][collection][roomId];
              const room = this._world.rooms.get(roomId);

              should(count)
                .be.aboveOrEqual(room.clients.confirmed.size - room.clients.deleting.size)
                .be.belowOrEqual(room.clients.confirmed.size + room.clients.unconfirmed.size + room.clients.deleting.size);
            }
          }
        }

        for (const room of this._world.rooms.values()) {
          const minimumPossibleClientsCount = room.clients.confirmed - room.clients.deleting.size;

          if (minimumPossibleClientsCount > 0) {
            should(response.result[room.index][room.collection][room.id])
              .be.above(0);
          }
        }
      });
  }

}

module.exports = List;

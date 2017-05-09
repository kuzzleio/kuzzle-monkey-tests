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

              if (room === undefined) {
                console.dir(response, {depth: null});
                this._suite.end(1);
              }


              let error = false;
              let min = room.clients.confirmed.size - room.clients.deleting.size;
              if (min < 0) {
                min = 0;
              }
              if (count < min) {
                // we may have subscribed before the list result was sent, in which case our confirmed size may not match

                let minConfirmedSize = room.clients.confirmed.size - room.clients.deleting.size;

                for (client of room.clients.confirmed) {
                  if (client._hasJustSubscribed(room, 500)) {
                    minConfirmedSize--;
                  }
                }

                if (count < minConfirmedSize) {
                  error = true;
                }
              }
              else if (count > room.clients.confirmed.size + room.clients.unconfirmed.size + room.clients.deleting.size) {
                error = true;
              }

              if (error) {
                console.log({
                  id: roomId,
                  received: count,
                  confirmed: [...room.clients.confirmed].map(client => client.uuid),
                  deleting: [...room.clients.deleting].map(client => client.uuid),
                  unconfirmed: [...room.clients.unconfirmed].map(client => client.uuid)
                });
                throw new Error('List count error');
              }
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

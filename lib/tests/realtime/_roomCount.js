const
  Bluebird = require('bluebird'),
  Test = require('../test');

class RoomCountTest extends Test {

  _validRoomCount (request, roomId, count, called = 0) {
    const room = this._world.rooms.get(roomId);

    if (room === undefined) {
      // unknown room - may be a non-confirmed subscription - retry in a little time
      if (called > 10) {
        throw new Error(`Unknown room ${roomId}`);
      }
      return Bluebird.delay(Math.round(this._suite.config.historyCheckMaxDelay / 10))
        .then(() => this._validRoomCount(request, roomId, count, called + 1));
    }

    let error = false;
    let min = room.clients.confirmed.size - room.clients.deleting.size;
    if (min < 0) {
      min = 0;
    }
    if (count < min) {
      // we may have subscribed before the list result was sent, in which case our confirmed size may not match
      for (const client of room.clients.confirmed) {
        if (client._hasJustSubscribed(room, this._suite.config.subscriptions.historyCheckMaxDelay)) {
          min--;
        }
      }

      if (count < min) {
        // still not good
        // may be due to a invalid hasJustSubscribed call because the response was not received. retry
        if (called > 10) {
          error = true;
        }
        else {
          return Bluebird.delay(Math.round(this._suite.config.subscriptions.historyCheckMaxDelay / 10))
            .then(() => this._validRoomCount(request, roomId, count, called + 1));
        }
      }
    }

    let max = room.clients.confirmed.size + room.clients.unconfirmed.size + room.clients.deleting.size;
    if (count > max) {
      // an unsubscription response may have come in between, trying again including rooms for which the client has just unsubscribed
      for (const client of room.clients.deleted) {
        if (client._hasJustUnsubscribed(room, this._suite.config.subscriptions.historyCheckMaxDelay)) {
          max++;
        }
      }

      if (count > max) {
        // still not good
        // may come from a new subscription which has not received its room yet. retry
        if (called > 10) {
          error = true;
        }
        else {
          return Bluebird.delay(Math.round(this._suite.config.subscriptions.historyCheckMaxDelay / 10))
            .then(() => this._validRoomCount(request, roomId, count, called + 1));
        }
      }
    }

    if (error) {
      console.log({
        req: request.id,
        id: roomId,
        received: count,
        expectedMin: min,
        expectedMax: max,
        confirmed: [...room.clients.confirmed].map(client => client.uuid),
        deleting: [...room.clients.deleting].map(client => client.uuid),
        deleted: [...room.clients.deleted].map(client => client.uuid),
        unconfirmed: [...room.clients.unconfirmed].map(client => client.uuid),
        index: room.index,
        collection: room.collection,
        filter: [...room.subscriptions.values()][0].filter.filter()
      });
      throw new Error('List count error');
    }

    return Bluebird.resolve();
  };

}

module.exports = RoomCountTest;


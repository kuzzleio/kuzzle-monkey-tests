'use strict';

class Room {
  constructor (id, index, collection) {
    this.id = id;
    this.index = index;
    this.collection = collection;

    this.clients = {
      confirmed: new Set(),
      deleted: new Set(),
      deleting: new Set(),
      unconfirmed: new Set(),
    };

    this.subscriptions = new Set();
  }

}

module.exports = Room;

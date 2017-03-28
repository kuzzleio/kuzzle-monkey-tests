class Room {

  constructor (id) {
    this.id = id;

    this.clients = new Set();
    this.subscriptions = new Set();
  }

}

module.exports = Room;

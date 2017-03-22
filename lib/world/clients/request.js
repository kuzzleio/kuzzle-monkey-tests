class Request {

  /**
   * @param {Client} client
   */
  constructor (client, id, data) {
    this.client = client;
    this.id = id;
    this.data = data;

    this.subscriptions = new Set();
  }

  send () {
    console.log(`${Date.now()}:${this.client._suite.world.padRight(this.id, 24)} /${this.data.controller}/${this.data.action}/${this.data.index}/${this.data.collection}/${this.data._id}`);
    return this.client._send(Object.assign({}, this.data, {requestId: this.id}));
  }

}

module.exports = Request;

class Request {

  /**
   * @param {Client} client
   */
  constructor (client, id, data) {
    this.client = client;
    this.id = id;
    this.data = data;
  }

  send () {
    console.log(`${Date.now()}:${this.client._suite.world.padRight(this.id, 24)} /${this.data.controller}/${this.data.action}/${this.data.index}/${this.data.collection}/${this.data._id}`);

    this.client.expectResponse(this);
    return this.client.send(Object.assign({}, this.data, {requestId: this.id}))
      .then(response => {
        if (response.error) {
          console.error(`${this.client.uuid} error received`);
          throw response.error;
        }

        return response;
      });
  }

}

module.exports = Request;

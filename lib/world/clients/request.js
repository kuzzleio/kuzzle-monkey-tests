class Request {

  /**
   * @param {Client} client
   */
  constructor (client, id, data) {
    this.client = client;
    this.id = id;
    this.data = data;
    this.timestamp = null;
  }

  send () {
    this.trace();

    this.timestamp = Date.now();

    this.client.expectResponse(this);
    return this.client.send(Object.assign({}, this.data, {requestId: this.id}))
      .then(response => {
        if (response.error) {
          console.error(`${this.client.uuid} error received`);
          throw response.error;
        }

        this.response = response;

        return response;
      });
  }

  trace () {
    let route = `/req/${this.data.controller}/${this.data.action}`;

    if (this.data.index) {
      route += `/${this.data.index}`;

      if (this.data.collection) {
        route += `/${this.data.collection}`;

        if (this.data._id) {
          route += `/${this.data._id}`;
        }
      }
    }
    if (this.data.body) {
      route += `/${JSON.stringify(this.data.body)}`;
    }

    return this.client._suite.trace(this.id, route);
  }

}

module.exports = Request;

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
    this.trace();

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

    return this.client._suite.trace(this.id, route);
  }

}

module.exports = Request;

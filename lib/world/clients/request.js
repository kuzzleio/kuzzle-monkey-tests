'use strict';

const CHAOS_ERRORS = [
  'core.realtime.room_not_found',
  'network.entrypoint.shutting_down',
];

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

  async send () {
    this.trace();
    this.timestamp = Date.now();
    this.client.expectResponse(this);

    const payload = Object.assign(
      {},
      this.data,
      { requestId: this.id, volatile: { id: this.id } });

    const response = await this.client.send(payload);

    if (response.error && this.client._suite.chaos.unsettled
      && CHAOS_ERRORS.includes(response.error.id)) {
      // While the chaos restarts a node, that node refuses requests until it
      // closes its connections, and the rooms only its clients subscribed to
      // vanish with them: nothing this request triggers will happen.
      for (const client of this.client._world.clients) {
        client.forgetRequest(this.id);
      }

      const error = new Error(`${this.client.uuid}: ${response.error.message}`);
      error.disconnected = true;
      throw error;
    }

    if (response.error) {
      console.error(`${this.client.uuid} error received`);
      console.error(this.data);
      throw response.error;
    }

    this.response = response;

    return response;
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

    this.client._suite.report('debug', {id: this.id, route});
    return this.client._suite.trace(this.id, route);
  }

}

module.exports = Request;

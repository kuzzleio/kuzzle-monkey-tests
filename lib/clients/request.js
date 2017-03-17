class Request {

  /**
   * @param {Client} client
   */
  constructor (client, requestId) {
    this.client = client;
    this.id = requestId;
  }

  send (req) {
    req.requestId = this.id;
    return this.client._send(req);
  }

}

module.exports = Request;

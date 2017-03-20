class Request {

  /**
   * @param {Client} client
   */
  constructor (client, requestId) {
    this.client = client;
    this.id = requestId;
    this.request = null;
  }

  send (req) {
    req.requestId = this.id;
    this.request = req;
    return this.client._send(req);
  }

}

module.exports = Request;

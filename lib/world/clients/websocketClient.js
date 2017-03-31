const
  Client = require('./client'),
  WS = require('uws');

class WebSocketClient extends Client {

  constructor (suite) {
    super(suite);

    this._ws = null;
}

  init () {
    return new Promise((resolve, reject) => {
      const config = this._suite.config.clients.websocket;

      this._ws = new WS(config.address, undefined, config.options);

      this._ws.on('open', resolve);

      this._ws.on('close', event => {
        console.error(event);   // eslint-disable-line no-console
        reject(new Error('Connection closed'));
      });

      this._ws.on('error', err => {
        console.error(err);     // eslint-disable-line no-console
        reject(err);
      });

      this._ws.on('message', (data) => this._onMessage(data));
    });
  }

  send (req) {
    return new Promise((resolve, reject) => {
      this._pendingRequests.get(req.requestId).resolve = resolve;
      this._ws.send(JSON.stringify(req), err => {
        if (err) {
          reject(err);
        }
      });
    });

  }

}

module.exports = WebSocketClient;

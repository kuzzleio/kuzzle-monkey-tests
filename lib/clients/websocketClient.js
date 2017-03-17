const
  Client = require('./client'),
  WS = require('ws');

class WebSocketClient extends Client {

  constructor (suite) {
    super(suite);

    this._ws = null;
    this._pendingRequests = {};
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

      this._ws.on('message', (data) => {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        if (this._pendingRequests[data.requestId]) {
          // direct ack response from a request emitted by current client
          this._pendingRequests[data.requestId](data);
          delete this._pendingRequests[data.requestId];
        }
        else {
          // notification
          if (!this._expectedNotifications[data.requestId]) {
            console.log(Object.keys(this._pendingRequests));
            throw new Error(`[${this.uuid}] unexpected notification received: ${JSON.stringify(data, undefined, 2)}`);
          }
          clearTimeout(this._expectedNotifications[data.requestId]);
          delete this._expectedNotifications[data.requestId];
        }

        // eslint-disable-next-line no-console
        console.log(this.uuid, data);

      });
    });
  }

  _send (req) {
    return new Promise((resolve, reject) => {
      this._pendingRequests[req.requestId] = resolve;
      this._ws.send(JSON.stringify(req), err => {
        if (err) {
          reject(err);
        }
      });
    });

  }

}

module.exports = WebSocketClient;

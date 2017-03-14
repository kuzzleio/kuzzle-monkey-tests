const
  Promise = require('bluebird'),
  uuid = require('uuid'),
  WS = require('ws');

class WebSocket {
  constructor (config) {
    this.config = config;
    this._ws = null;

    this.uuid = uuid.v4();
    this._requestIdIncr = 0;
    this._pendingRequests = {};
  }

  init () {
    return new Promise((resolve, reject) => {
      this._ws = new WS(this.config.address, undefined, this.config.options);

      this._ws.on('open', resolve);

      this._ws.on('close', event => {
        console.error(event);
        reject(new Error('Connection closed'));
      });

      this._ws.on('error', err => {
        console.error(err);
        reject(err);
      });

      this._ws.on('message', (data) => {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        if (this._pendingRequests[data.requestId]) {
          this._pendingRequests[data.requestId](data);
          delete this._pendingRequests[data.requestId];
        }

        console.log(this.uuid, data);

      });
    });
  }

  send (req) {
    req.requestId = `${this.uuid}-${++this._requestIdIncr}`;

    return new Promise((resolve, reject) => {
      this._pendingRequests[req.requestId] = resolve;
      this._ws.send(JSON.stringify(req), err => {
        if (err) {
          reject(err);
        }
      });
    })
  }


}

module.exports = WebSocket;

'use strict';

const Client = require('./client');
const Bluebird = require('bluebird');
const WS = require('ws');

class WebSocketClient extends Client {
  constructor (suite) {
    super(suite);

    this._ws = null;
  }

  init () {
    return this._connect();
  }

  /**
   * Retries until a node accepts the connection
   */
  async reconnect () {
    for (;;) {
      try {
        return await this._connect();
      }
      catch (error) {
        await Bluebird.delay(1000);
      }
    }
  }

  _connect () {
    return new Bluebird((resolve, reject) => {
      const config = this._suite.config.clients.websocket;
      const ws = new WS(config.address, undefined, config.options);
      let open = false;

      ws.on('open', () => {
        open = true;
        this._ws = ws;
        resolve();
      });

      ws.on('close', event => {
        if (!open) {
          return reject(new Error(`Connection closed (${event})`));
        }

        this.disconnected().catch(error => this._suite.scheduler._fail(error));
      });

      ws.on('error', err => {
        if (!open) {
          reject(err);
        }
      });

      ws.on('message', (data) => this._onMessage(data));
    });
  }

  send (req) {
    return new Bluebird((resolve, reject) => {
      const pending = this._pendingRequests.get(req.requestId);
      pending.resolve = resolve;
      pending.reject = reject;

      this._ws.send(JSON.stringify(req), err => {
        if (err) {
          reject(err);
        }
      });
    });
  }

}

module.exports = WebSocketClient;

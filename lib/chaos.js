'use strict';

const { exec } = require('child_process');

let _suite;

/**
 * Restarts a Kuzzle node during the run, with `chaos.command` (a shell
 * command, e.g. `docker compose -f ... restart kuzzle_node_2`), `chaos.after`
 * seconds after the first test.
 *
 * What must hold:
 * - the clients connected to the other nodes miss no notification and no
 *   response (the usual expectations, unchanged);
 * - the clients of the restarted node reconnect and subscribe again to all
 *   their rooms within `chaos.recovery` seconds.
 *
 * Room counts are not checked while the cluster settles: the restarted node's
 * subscriptions are only removed once the other nodes evict it.
 */
class Chaos {
  constructor (suite) {
    _suite = suite;
    this.config = suite.config.chaos;
    this.enabled = Boolean(this.config && this.config.command);

    this._timer = null;
    this._recoveryTimer = null;
    this._settledAt = null;
    this._startedAt = null;
    this._disconnected = new Set();
    this._recovered = new Set();
    this.done = !this.enabled;
  }

  /**
   * Whether room counts may be wrong: from the restart until all clients are
   * back, plus `chaos.settle` seconds.
   */
  get unsettled () {
    if (this._startedAt === null) {
      return false;
    }

    return this._settledAt === null
      || Date.now() < this._settledAt + this.config.settle * 1000;
  }

  get started () {
    return this._startedAt !== null;
  }

  start () {
    if (!this.enabled) {
      return;
    }

    this._timer = setTimeout(() => this._restart(), this.config.after * 1000);
  }

  stop () {
    clearTimeout(this._timer);
    clearTimeout(this._recoveryTimer);
  }

  /**
   * @param {Client} client
   */
  disconnected (client) {
    this._disconnected.add(client);
    this._recovered.delete(client);
    this._settledAt = null;
  }

  /**
   * @param {Client} client
   */
  recovered (client) {
    this._recovered.add(client);

    if (this._recovered.size === this._disconnected.size) {
      this._settledAt = Date.now();
      _suite.log('info', `chaos: ${this._disconnected.size} client(s) reconnected and subscribed again in ${this._settledAt - this._startedAt}ms`);
    }
  }

  report () {
    if (!this.enabled) {
      return;
    }

    _suite.log('info', `chaos: ${this._startedAt === null ? 'node never restarted' : `${this._disconnected.size} client(s) disconnected, ${this._recovered.size} recovered`}`);
  }

  _restart () {
    _suite.log('info', `chaos: ${this.config.command}`);
    this._startedAt = Date.now();

    exec(this.config.command, (error, stdout, stderr) => {
      if (error) {
        _suite.log('error', `chaos: the restart command failed\n${stderr}`);
        return _suite.scheduler._fail(error);
      }

      _suite.log('info', `chaos: node restarted in ${Date.now() - this._startedAt}ms, ${this._disconnected.size} client(s) disconnected`);

      if (this._disconnected.size === 0) {
        return _suite.scheduler._fail(new Error('chaos: no client was disconnected by the restart'));
      }

      this._recoveryTimer = setTimeout(() => {
        const missing = [...this._disconnected].filter(c => !this._recovered.has(c));

        if (missing.length > 0) {
          _suite.scheduler._fail(new Error(`chaos: ${missing.length} client(s) not back ${this.config.recovery}s after the restart: ${missing.map(c => c.uuid).join(', ')}`));
        }
        this.done = true;
      }, this.config.recovery * 1000);
    });
  }
}

module.exports = Chaos;

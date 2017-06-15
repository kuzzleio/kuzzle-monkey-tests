class RequestHistory {

  constructor (client) {
    this._client = client;
    this._arr = [];
  }

  get _suite () {
    return this._client._suite;
  }

  get length () {
    return this._arr.length;
  }

  /**
   * @param {Request} request
   */
  push (request) {
    this._clean();
    this._arr.push(request);
  }

  get (index) {
    return this._arr[index];
  }

  _clean () {
    if (this._arr.length === 0) {
      return;
    }

    let i = 0;
    while (i < this._arr.length && this._arr[i].timestamp < Date.now() - this._suite.config.subscriptions.historyCheckMaxDelay) {
      i++;
    }
    this._arr.splice(0, i);
  }

}

module.exports = RequestHistory;

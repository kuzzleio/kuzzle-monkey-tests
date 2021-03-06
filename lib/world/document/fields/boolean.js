'use strict';

const Field = require('./field');
const values = [false, true];

class Boolean extends Field {
  constructor (suite) {
    super(suite);

    this._value = suite.rand.bool();
  }

  static getAllValues () {
    return values;
  }
}

module.exports = Boolean;

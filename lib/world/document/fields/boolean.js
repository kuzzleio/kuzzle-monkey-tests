const
  Field = require('./field'),
  values = [false, true];

class Boolean extends Field {
  constructor (suite) {
    super(suite);

    this._value = suite.rand.random() >= 0.5;
  }

  static getAllValues () {
    return values;
  }
}

module.exports = Boolean;

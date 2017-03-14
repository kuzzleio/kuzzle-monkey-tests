const
  Field = require('./field'),
  values = [false, true];

class Boolean extends Field {
  constructor () {
    super();

    this._values = values;
    this._value = Math.random() > 0.5;
  }
}

module.exports = Boolean;

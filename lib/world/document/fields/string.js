const
  Field = require('./field'),
  values = [
    'foo'
  ];

class String extends Field {

  constructor (params) {
    super(params);

    this._values = values;
    this._value = this._values[Math.round(Math.random() * Number.MAX_SAFE_INTEGER) % this._values.length];
  }

}

module.exports = String;

const
  Field = require('./field'),
  values = [
    [43.607373, 3.913112],     // kaliop
    [43.603830, 3.919399]
  ];

class GeoPoint extends Field {

  constructor () {
    super();

    this._values = values;
    this._value = this._values[Math.round(Math.random() * Number.MAX_SAFE_INTEGER) % this._values.length];
  }

}

module.exports = GeoPoint;

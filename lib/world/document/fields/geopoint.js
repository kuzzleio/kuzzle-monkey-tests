const
  Field = require('./field'),
  values = [
    [43.607373, 3.913112],     // kaliop
    [43.603830, 3.919399]
  ];

class GeoPoint extends Field {

  constructor (suite) {
    super(suite);

    this._value = suite.rand.pick(values);
  }

  static getAllValues () {
    return values;
  }

}

module.exports = GeoPoint;

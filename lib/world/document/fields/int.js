const
  Field = require('./field'),
  values = [
    Number.MIN_SAFE_INTEGER,
    -99999,
    -100,
    -10,
    -8,
    -6,
    0,
    1,
    2,
  ];

for (let i = 17; i < 234; i++) {
  values.push(i);
}

class Int extends Field {

  constructor (suite) {
    super(suite);
    this._value = suite.rand.pick(values);
  }

  static getAllValues () {
    return values;
  }
}

module.exports = Int;

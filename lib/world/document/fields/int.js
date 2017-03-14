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

{
  for (let i = 17; i < 234; i++) {
    values.push(i);
  }
}

class Int extends Field {

  constructor () {
    super();
    this._values = values;
    this._value = this._values[Math.round(Math.random() * Number.MAX_SAFE_INTEGER) % this._values.length];
  }

}

module.exports = Int;

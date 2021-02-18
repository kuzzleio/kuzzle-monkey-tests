'use strict';

const Field = require('./field');
const values = [
  'bar',
  'foo',
  'All your base are belong to us',
  'Mais où retrouver à présent la trace presque effacée de l\'ancien crime ? - Sophocle, Oedipe-Roi',
];

class String extends Field {
  constructor (suite) {
    super(suite);

    this._value = suite.rand.pick(values);
  }

  static getAllValues () {
    return values;
  }
}

module.exports = String;

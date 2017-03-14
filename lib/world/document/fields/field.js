class Field {

  constructor () {
    this._values = null;
    this._value = null;
  }

  get values () {
    return this._values;
  }

  get value () {
    return this._value;
  }

}

module.exports = Field;

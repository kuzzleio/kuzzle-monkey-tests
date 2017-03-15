class Field {

  /**
   *
   * @param {Suite} suite
   */
  constructor (suite) {
    this.suite = suite;
    this._value = null;
  }

  get value () {
    return this._value;
  }

  static getAllValues () {
    throw new Error('This method is just there for self documentation. It should be implemented for each child class');
  }
}

module.exports = Field;

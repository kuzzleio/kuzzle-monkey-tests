'use strict';

let _suite;

class Field {
  /**
   *
   * @param {Suite} suite
   */
  constructor () {
    this._value = null;
  }

  get _suite () {
    return _suite;
  }

  get value () {
    return this._value;
  }

  static getAllValues () {
    throw new Error('This method is just there for self documentation. It should be implemented for each child class');
  }
}

module.exports = Field;

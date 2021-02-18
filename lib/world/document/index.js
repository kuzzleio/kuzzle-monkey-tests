'use strict';

const fields = require('./fields');
const { v4: uuid } = require('uuid');

class Document {
  constructor (suite) {
    this.index = suite.rand.pick(Object.keys(suite.world.indexes));
    this.collection = suite.rand.pick(suite.world.indexes[this.index]);

    this._id = uuid();

    this.string = new fields.String(suite);
    this.int = new fields.Int(suite);
    this.float = new fields.Float(suite);
    this.boolean = new fields.Boolean(suite);
    this.geoPoint = new fields.GeoPoint(suite);
    this.nested = {
      boolean: new fields.Boolean(suite),
      float: new fields.Float(suite),
      int: new fields.Int(suite),
      string: new fields.String(suite),
    };

    this.subscriptions = new Set();
  }

  serialize () {
    return {
      _id: this._id,
      boolean: this.boolean.value,
      float: this.float.value,
      geoPoint: this.geoPoint.value,
      int: this.int.value,
      nested: {
        boolean: this.nested.boolean.value,
        float: this.nested.float.value,
        int: this.nested.int.value,
        string: this.nested.string.value,
      },
      string: this.string.value,
    };
  }
}

module.exports = Document;

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
      int: new fields.Int(suite),
      float: new fields.Float(suite),
      boolean: new fields.Boolean(suite),
      string: new fields.String(suite)
    };

    this.subscriptions = new Set();
  }

  serialize () {
    return {
      _id: this._id,
      string: this.string.value,
      int: this.int.value,
      float: this.float.value,
      boolean: this.boolean.value,
      geoPoint: this.geoPoint.value,
      nested: {
        int: this.nested.int.value,
        float: this.nested.float.value,
        boolean: this.nested.boolean.value,
        string: this.nested.string.value
      }
    };
  }

}

module.exports = Document;

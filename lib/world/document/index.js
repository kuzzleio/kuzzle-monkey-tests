const
  fields = require('./fields'),
  uuid = require('uuid');

class Document {

  constructor () {
    this._id = uuid.v4();
    this.string = new fields.String();
    this.int = new fields.Int();
    this.float = new fields.Float();
    this.boolean = new fields.Boolean();
    this.geoPoint = new fields.GeoPoint();
    this.nested = {
      int: new fields.Int(),
      float: new fields.Float(),
      boolean: new fields.Boolean(),
      string: new fields.String()
    }
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
    }
  }
}

module.exports = Document;

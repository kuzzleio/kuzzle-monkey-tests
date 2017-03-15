const
  Document = require('./document');

let
  _suite;

class World {
  constructor (suite) {
    _suite = suite;

    this.indexes = ['index1', 'index2', 'index3', 'index4'];
    this.documents = {};

    this._buildDocuments();
  }

  get _suite () {
    return _suite;
  }

  _buildDocuments () {
    for (let i = 0; i < this.suite.config.documents.number; i++) {
      const doc = new Document(this.suite);
      this.documents[doc._id] = doc;
    }
  }
}

module.exports = World;

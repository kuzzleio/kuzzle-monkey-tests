const
  Document = require('./document');

let
  _suite;

class World {

  constructor (suite) {
    _suite = suite;

    this.documents = new Set();
    this._buildDocuments();
  }

  _buildDocuments () {
    for (let i = 0; i < _suite.config.documents.number; i++) {
      const doc = new Document(_suite);
      this.documents.add(doc);
    }
  }
}

module.exports = World;

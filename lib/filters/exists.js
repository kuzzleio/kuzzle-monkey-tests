const
  _ = require('lodash'),
  Filter = require('./filter');

class Exists extends Filter {

  constructor (suite, field) {
    super(suite);

    this.field = field;

    this.refreshMatches();
  }

  get filter () {
    return {
      exists: {
        field: this.field
      }
    };
  }

  _filterMatches (doc) {
    return _.get(doc.serialize(), this.field) !== undefined;
  }

}

module.exports = Exists;

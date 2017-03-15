const
  _ = require('lodash'),
  Filter = require('./filter');

class Missing extends Filter {

  constructor (suite, field) {
    super(suite);

    this.field = field;

    this.refreshMatches();
  }

  get filter () {
    return {
      missing : {
        field: this.field
      }
    };
  }

  _filterMatches (doc) {
    return _.get(doc.serialize(), this.field) === undefined;
  }

}

module.exports = Missing;

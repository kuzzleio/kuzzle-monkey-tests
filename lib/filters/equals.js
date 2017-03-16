const
  _ = require('lodash'),
  Filter = require('./filter'),
  fields = require('../world/document/fields');

class Equals extends Filter {

  constructor (suite, field, value) {
    super(suite);

    if (field === undefined) {
      field = suite.oneOf(['string', 'nested.string']);
    }
    this.field = field;

    if (value === undefined) {
      value = suite.oneOf(fields.String.getAllValues());
    }
    this.value = value;

    this.refreshMatches();
  }

  get filter () {
    return {
      equals: {
        [this.field]: this.value
      }
    };
  }

  _filterMatches (doc) {
    return _.get(doc.serialize(), this.field) === this.value;
  }


}

module.exports = Equals;

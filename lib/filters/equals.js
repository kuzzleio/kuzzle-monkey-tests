const
  _ = require('lodash'),
  Filter = require('./filter'),
  fields = require('../world/document/fields');

class Equals extends Filter {

  constructor (suite, field = 'string', value) {
    super(suite);

    if (value === undefined) {
      value = suite.oneOf(fields.String.getAllValues());
    }
    this.value = value;
    this.field = field;

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

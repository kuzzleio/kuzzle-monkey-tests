const
  _ = require('lodash'),
  fields = require('../world/document/fields'),
  Filter = require('./filter');

class Regexp extends Filter {

  constructor (suite, field, value) {
    super(suite);

    if (field === undefined) {
      field = suite.oneOf(['string', 'nested.string']);
    }
    this.field = field;

    if (value === undefined) {
      const
        allValues = fields.String.getAllValues();

      value = new RegExp(suite.oneOf(allValues).substring(0, 3) + '.*');
    }
    this.value = value;

    this.refreshMatches();
  }

  _filterMatches (doc) {
    return this.value.test(_.get(doc.serialize(), this.field));
  }

  get filter () {
    return {
      regexp: {
        [this.field]: this.value.source
      }
    }
  }

}

module.exports = Regexp;

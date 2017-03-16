const
  _ = require('lodash'),
  fields = require('../world/document/fields'),
  Filter = require('./filter');

class In extends Filter {

  constructor (suite, field, values) {
    super(suite);

    if (field === undefined) {
      this.field = suite.oneOf(['string', 'nested.string']);
    }

    if (values === undefined) {
      values = [];
      const allValues = fields.String.getAllValues();

      for (let i = 0; i < suite.rand(allValues.length) + 1; i++) {
        values.push(suite.oneOf(allValues));
      }
    }

    this.values = values;

    this.refreshMatches();
  }

  get filter () {
    return {
      in: {
        [this.field]: this.values
      }
    };
  }

  _filterMatches (doc) {
    return this.values.indexOf(_.get(doc.serialize(), this.field)) > -1;
  }

}

module.exports = In;

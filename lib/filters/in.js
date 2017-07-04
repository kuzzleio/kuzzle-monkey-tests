const
  _ = require('lodash'),
  fields = require('../world/document/fields'),
  Filter = require('./filter');

class In extends Filter {

  constructor (suite, field, values) {
    super(suite);

    if (field === undefined) {
      this.field = suite.rand.pick(['string', 'nested.string']);
    }

    if (values === undefined) {
      this.values = [];
      const allValues = fields.String.getAllValues();

      for (let i = 0; i < suite.rand.integer(1, allValues.length); i++) {
        this.values.push(suite.rand.pick(allValues));
      }
    }
    else {
      this.values = values;
    }
  }

  filter () {
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

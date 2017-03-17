const
  _ = require('lodash'),
  fields = require('../world/document/fields'),
  Filter = require('./filter');

class Regexp extends Filter {

  constructor (suite, field, value) {
    super(suite);

    if (field === undefined) {
      field = suite.rand.pick(['string', 'nested.string']);
    }
    this.field = field;

    if (value === undefined) {
      const
        allValues = fields.String.getAllValues();

      value = new RegExp(suite.rand.pick(allValues).substring(0, 3) + '.*');
    }
    this.value = value;
  }

  _filterMatches (doc) {
    return this.value.test(_.get(doc.serialize(), this.field));
  }

  get filter () {
    // @TODO:
    // * take flags into account
    // * switch between simple & complex form (once fixed on kuzzle side)
    return {
      regexp: {
        [this.field]: {
          value: this.value.source
        }
      }
    }
  }

}

module.exports = Regexp;

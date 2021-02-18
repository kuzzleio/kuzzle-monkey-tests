'use strict';

const _ = require('lodash');
const fields = require('../world/document/fields');
const Filter = require('./filter');

class Regexp extends Filter {
  constructor (suite, field, value) {
    super(suite);

    if (field === undefined) {
      this.field = suite.rand.pick(['string', 'nested.string']);
    }
    else {
      this.field = field;
    }

    if (value === undefined) {
      const
        allValues = fields.String.getAllValues();

      this.value = new RegExp(suite.rand.pick(allValues).substring(0, 3) + '.*');
    }
    else {
      this.value = value;
    }
  }

  _filterMatches (doc) {
    return this.value.test(_.get(doc.serialize(), this.field));
  }

  filter () {
    // @TODO:
    // * take flags into account
    // * switch between simple & complex form (once fixed on kuzzle side)
    return {
      regexp: {
        [this.field]: {
          value: this.value.source
        }
      }
    };
  }
}

module.exports = Regexp;

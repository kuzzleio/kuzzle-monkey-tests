'use strict';

const _ = require('lodash');
const Filter = require('./filter');

const constants = [
  'string',
  'int',
  'float',
  'boolean',
  'geoPoint',
  'nested.int',
  'nested.float',
  'nested.boolean',
  'nested.string',
  '_nonExistingString',
  '_nonExistingInt',
  '_nonExistingFloat',
  '_nonExistingBoolean',
  '_nonExistingGeoPoint',
  '_nonExistingNested.int',
  '_nonExistingNested.float',
  '_nonExistingNested.boolean',
  '_nonExistingNested.string',
];

class Missing extends Filter {
  constructor (suite, field) {
    super(suite);

    if (field === undefined) {
      this.field = suite.rand.pick(constants);
    }
    else {
      this.field = field;
    }
  }

  filter () {
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

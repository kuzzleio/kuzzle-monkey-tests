const
  _ = require('lodash'),
  Filter = require('./filter');

class Missing extends Filter {

  constructor (suite, field) {
    super(suite);

    if (field === undefined) {
      this.field = suite.rand.pick([
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
        '_nonExistingNested.string'
      ]);
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

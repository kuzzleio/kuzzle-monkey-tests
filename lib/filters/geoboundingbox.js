
'use strict';

const Filter = require('./filter');

class GeoBoundingBox extends Filter {
  constructor (suite, field='geoPoint', coordinates) {
    super(suite);

    this.field = field;
    this.coordinates = coordinates;
  }

  filter () {
    return {
      geoBoundingBox: {
        [this.field]: {

        }
      }
    };
  }

  _filterMatches () {
    throw new Error('not implemented');
  }
}

module.exports = GeoBoundingBox;

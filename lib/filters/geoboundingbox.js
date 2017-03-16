const
  _ = require('lodash'),
  Filter = require('./filter'),
  geolib = require('geolib');

class GeoBoundingBox extends Filter {

  constructor (suite, field='geoPoint', coordinates) {
    super(suite);

    this.field = field;
    this.coordinates = coordinates;

    this.refreshMatches();
  }

  get filter () {
    return {
      geoBoundingBox: {
        [this.field]: {

        }
      }
    }
  }

  _filterMatches (doc) {

  }


}

module.exports = GeoBoundingBox;

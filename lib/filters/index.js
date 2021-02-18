'use strict';

exports.filters = {
  Equals: require('./equals'),
  Exists: require('./exists'),
  // GeoBoundingBox: require('./geoboundingbox'),
  Ids: require('./ids'),
  In: require('./in'),
  Missing: require('./missing'),
  Range: require('./range'),
  Regexp: require('./regexp')
};

// operands
exports.operands = require('./operands');

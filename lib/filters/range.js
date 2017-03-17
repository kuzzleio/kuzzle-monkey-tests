const
  _ = require('lodash'),
  fields = require('../world/document/fields'),
  Filter = require('./filter');

class Range extends Filter {

  constructor (suite, field, values) {
    super(suite);

    if (field === undefined) {
      field = suite.rand.pick([
        'int',
        'float',
        'nested.int',
        'nested.float'
      ]);
    }
    this.field = field;

    if (values === undefined) {
      values = {};

      let
        lt = false,
        gt = false,
        ltgtorboth = suite.rand.integer(0, 2);

      if (ltgtorboth === 0) {
        lt = true;
      }
      else if (ltgtorboth === 1) {
        gt = true;
      }
      else {
        lt = true;
        gt = true;
      }

      let
        vals = [],
        pickIn;
      if (this.field.endsWith('int')) {
        pickIn = fields.Int.getAllValues();
      }
      else {
        pickIn = fields.Float.getAllValues();
      }

      for (let i = 0; i < 2; i++) {
        vals.push(suite.rand.pick(pickIn));
      }

      if (gt) {
        const op = suite.rand.bool() ? 'gt' : 'gte';
        values[op] = Math.min.apply(null, vals);
      }
      if (lt) {
        const op = suite.rand.bool() ? 'lt' : 'lte';
        values[op] = Math.max.apply(null, vals);
      }
    }

    this.values = values;
  }

  get filter () {
    return {
      range: {
        [this.field]: this.values
      }
    };
  }

  _filterMatches (doc) {
    let res = Object.keys(this.values).length > 0;
    const docVal = _.get(doc.serialize(), this.field);

    Object.keys(this.values).forEach(op => {
      if (op === 'lt') {
        res &= docVal < this.values[op];
      }
      else if (op === 'lte') {
        res &= docVal <= this.values[op];
      }
      else if (op === 'gt') {
        res &= docVal > this.values[op];
      }
      else if (op === 'gte') {
        res &= docVal >= this.values[op];
      }
    });

    return res;
  }

}

module.exports = Range;

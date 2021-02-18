'use strict';

const _ = require('lodash');
const fields = require('../world/document/fields');
const Filter = require('./filter');

class Range extends Filter {
  constructor (suite, field, values) {
    super(suite);

    if (field === undefined) {
      this.field = suite.rand.pick([
        'int',
        'float',
        'nested.int',
        'nested.float',
      ]);
    }
    else {
      this.field = field;
    }

    if (values === undefined) {
      this.values = {};

      let lt = false;
      let gt = false;
      const ltgtorboth = suite.rand.integer(0, 2);

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

      const vals = [];
      let pickIn;

      if (this.field.endsWith('int')) {
        pickIn = fields.Int.getAllValues();
      }
      else {
        pickIn = fields.Float.getAllValues();
      }

      vals.push(suite.rand.pick(pickIn));
      vals.push(suite.rand.pick(pickIn.filter(v => v !== vals[0])));

      if (gt) {
        const op = suite.rand.bool() ? 'gt' : 'gte';
        this.values[op] = Math.min.apply(null, vals);
      }
      if (lt) {
        const op = suite.rand.bool() ? 'lt' : 'lte';
        this.values[op] = Math.max.apply(null, vals);
      }
    }
    else {
      this.values = values;
    }
  }

  filter () {
    return {
      range: {
        [this.field]: this.values
      }
    };
  }

  _filterMatches (doc) {
    const docVal = _.get(doc.serialize(), this.field);
    const valueKeys = Object.keys(this.values);
    let res = valueKeys.length > 0;

    for (const op of valueKeys) {
      if (op === 'lt') {
        res = res && docVal < this.values[op];
      }
      else if (op === 'lte') {
        res = res && docVal <= this.values[op];
      }
      else if (op === 'gt') {
        res = res && docVal > this.values[op];
      }
      else if (op === 'gte') {
        res = res && docVal >= this.values[op];
      }
    }

    return res;
  }

}

module.exports = Range;

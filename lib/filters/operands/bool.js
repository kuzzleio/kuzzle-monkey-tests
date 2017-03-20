const
  Operand = require('./operand');

class Bool extends Operand {

  constructor (suite, ...filters) {
    super(suite, filters);

    this.must = new Set();
    this.must_not = new Set();
    this.should = new Set();
    this.should_not = new Set();

    for (let filter of filters) {
      this._assignFilter(filter);
    }
  }

  add (...filters) {
    for (let f of filters) {
      this._assignFilter(f);
    }
  }

  remove (...filters) {
    for (let f of filters) {
      for (let s of [this.must, this.must_not, this.should, this.should_not]) {
        s.remove(f);
      }
    }
  }

  /**
   *
   * @param {Filter} filter
   * @private
   */
  _assignFilter (filter) {
    const random = this._suite.rand.integer(0, 3);

    [this.must, this.must_not, this.should, this.should_not][random].add(filter);
  }

  matches () {
    let
      m;

    if (this.must.size > 0) {
      m = Array.from([...this.must]
        .map(f => f.matches())
        .reduce((acc, curr) => {
          return new Set([...curr].filter(x => acc.has(x)));
        }));

      if (m.length === 0) {
        return new Set();
      }
    }

    if (this.must_not.size > 0) {
      const acc = m || this._suite.world.documents;

      m = Array.from([...this.must_not]
        .map(f => f.matches())
        .reduce((acc, curr) => {
          return new Set([...acc].filter(x => !curr.has(x)));
        }, acc));

      if (m.length === 0) {
        return new Set();
      }
    }

    if (this.should.size > 0) {
      const shouldMatches = Array.from([...this.should]
        .map(f => f.matches())
        .reduce((acc, curr) => {
          return new Set([...acc, ...curr]);
        }));

      if (!m) {
        m = shouldMatches;
      }
      else {
        const mSet = new Set(m);
        m = shouldMatches.filter(x => mSet.has(x));
      }
    }

    if (this.should_not.size > 0) {
      const shouldMatches = Array.from([...this.should_not]
        .map(f => f.matches())
        .reduce((acc, curr) => {
          const notSet = new Set([...this._suite.world.documents].filter(x => !curr.has(x)));

          return new Set([...acc, ...notSet]);
        }));

      if (!m) {
        m = shouldMatches;
      }
      else {
        const mSet = new Set(m);
        m = shouldMatches.filter(x => mSet.has(x));
      }
    }

    return new Set(m);
  }

  filter () {
    const res = {
      bool: {}
    };

    for (let section of ['must', 'must_not', 'should', 'should_not']) {
      for (let f of this[section]) {
        if (!res.bool[section]) {
          res.bool[section] = [];
        }
        res.bool[section].push(f.filter());
      }
    }

    return res;
  }

}

module.exports = Bool;

const
  Action = require('../actions/action');

class Scenario extends Action {

  constructor(suite) {
    this.suite = suite;
  }

}

module.exports = Scenario;

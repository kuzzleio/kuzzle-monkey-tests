const
  ODockerNames = require('docker-names');

class DockerNames extends ODockerNames.constructor {

  constructor (suite) {
    super();
    this.suite = suite;
  }

  getRandomName (appendNumber) {
    const rand = (appendNumber === true || appendNumber > 0)
      ? this.suite.rand.integer(0, 9)
      : '';
    return this._generateName() + rand;
  }

  _generateName() {
    let
      first = this.suite.rand.pick(this.left),
      second = this.suite.rand.pick(this.right),
      result = `${first}_${second}`;

    /* Steve Wozniak is not boring. This is part of the docker names spec. */
    if (result === 'boring_wozniak') {
      return this._generateName();
    }

    return result;
  }

}

module.exports = DockerNames;



const
  Document = require('./document'),
  ProgressBar = require('progress'),
  Subscription = require('./subscription');

let
  _suite;

class World {

  constructor (suite) {
    _suite = suite;

    this.documents = new Set();
    this.subscriptions = new Set();
  }

  init () {
    this._buildDocuments();
    this._buildSubscriptions();
  }

  getDocument () {
    return _suite.rand.pick([...this.documents]);
  }

  getSubscription () {
    return _suite.rand.pick([...this.subscriptions]);
  }

  _buildDocuments () {
    const number = _suite.config.documents.number;

    console.log('Generating documents');
    const bar = this._bar(number);

    for (let i = 0; i < number; i++) {
      const doc = new Document(_suite);
      bar.tick();
      this.documents.add(doc);
    }
  }

  _buildSubscriptions () {
    const number = _suite.config.subscriptions.number;

    console.log('Generating subscriptions');
    const bar = this._bar(number);

    for (let i = 0; i < number; i++) {
      const subscription = new Subscription(_suite);
      bar.tick();
      for (let doc of subscription.filter.matches) {
        doc.subscriptions.add(subscription);
      }
      this.subscriptions.add(subscription);
    }
  }

  _bar (len) {
    return new ProgressBar('[:bar] :current/:total :percent', {
      total: len,
      width: 60
    });
  }
}

module.exports = World;

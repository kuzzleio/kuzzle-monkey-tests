const
  Action = require('./action');

class Subscribe extends Action {

  constructor (suite) {
    super(suite);
  }

  run () {
    const
      client = this._suite.getClient(),
      data = {
        controller: 'realtime',
        action: 'subscribe',
        index: suite.oneOf(suite.world.indexes),
        collection: suite.oneOf(suite.world.collections),
        body: 
      };

    return client.send({

    });
  }

}

module.exports = Subscribe;

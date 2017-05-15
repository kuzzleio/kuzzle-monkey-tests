const
  Bluebird = require('bluebird'),
  RoomCountTest = require('./_roomCount');

class List extends RoomCountTest {

  _run () {
    const
      client = this._world.getClient(),
      request = client.createRequest({
        controller: 'realtime',
        action: 'list'
      });

    return request.send()
      .then(response => {
        const promises = [];

        for (const index of Object.keys(response.result)) {
          for (const collection of Object.keys(response.result[index])) {
            for (const roomId of Object.keys(response.result[index][collection])) {
              const count = response.result[index][collection][roomId];

              promises.push(this._validRoom(request, roomId, count));
            }
          }
        }

        return Bluebird.all(promises);
      });
  }

}

module.exports = List;

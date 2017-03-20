const
  fs = require('fs'),
  path = require('path');

const all = {};

fs.readdirSync(__dirname)
  .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory())
  .forEach(dir => {
    const files = fs.readdirSync(path.join(__dirname, dir));

    if (files.length) {
      all[dir] = {};

      files.forEach(f => {
        all[dir][f] = require('./' + path.join(dir, f));
      })
    }
  });

module.exports = all;

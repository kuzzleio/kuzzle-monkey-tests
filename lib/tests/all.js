const
  fs = require('fs'),
  path = require('path');

const all = {};

for (const dir of fs.readdirSync(__dirname)
  .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory())) {
  const files = fs.readdirSync(path.join(__dirname, dir));

  if (files.length) {
    all[dir] = {};

    for (const f of files) {
      all[dir][f.replace(/\.js$/, '')] = require('./' + path.join(dir, f));
    }
  }
}

module.exports = all;

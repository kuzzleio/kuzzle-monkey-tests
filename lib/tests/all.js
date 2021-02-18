'use strict';

const fs = require('fs');
const path = require('path');

const all = {};

const directories = fs
  .readdirSync(__dirname)
  .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory());

for (const dir of directories) {
  const files = fs.readdirSync(path.join(__dirname, dir));

  if (files.length) {
    all[dir] = {};

    for (const file of files.filter(f => !f.startsWith('_'))) {
      all[dir][file.replace(/\.js$/, '')] = require('./' + path.join(dir, file));
    }
  }
}

module.exports = all;

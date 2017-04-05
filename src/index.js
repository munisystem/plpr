'use strict';

const REGEX = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.?\d* \D{3}).* duration: (\d+\.\d+) ms  execute <unnamed>: (.+)?/;
var objs = [];

module.exports = data => {
  const lines = data.split(/\r\n|\r|\n/);

  var content = [];
  lines.forEach(line => {
    if (line.includes(':  ')) {
      if (content.length == 0) {
        content.push(line);
        return;
      } else {
        parser(content.join(''));
        content = [];
      }
      content.push(line);
    }
    parser(content.join(''));
  });
  return objs;
}

function parser(data) {
  const matches = data.match(REGEX);
  if (matches !== null) {
    objs.push({timestamp: matches[1], duration: matches[2], query: matches[3]});
  }
}

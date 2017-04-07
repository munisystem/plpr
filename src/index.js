'use strict';

const regexBase = 'LOG:  duration: (\\d+\\.\\d+) ms  execute .*: (.+)?';
const regexps = {
  '%u': ['user', '([0-9a-zA-Z\\.\\-\\_\\[\\]]*)?'],
  '%d': ['dbname','([0-9a-zA-Z\\.\\-\\_\\[\\]]*)?'],
  '%r': ['hostport', '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\(\\d+\\))?'],
  '%h': ['host', '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})?'],
  '%p': ['pid', '(\\d+)*'],
  '%t': ['timestamp', '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} \\D{3})'],
  '%m': ['mtimestamp', '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d* \\D{3})'],
};

var objs = [];
var obj_keys = [];
var regex = null;

module.exports = (data, format) => {
  format = format.replace(/\./, '\\.')
                 .replace(/\-/, '\\-')
                 .replace(/\_/, '\\_')
                 .replace(/\*/, '\\*')
                 .replace(/\?/, '\\?')
                 .replace(/\^/, '\\^')
                 .replace(/\$/, '\\$')
                 .replace(/\+/, '\\+')
                 .replace(/\[/, '\\[')
                 .replace(/\]/, '\\]')
                 .replace(/\{/, '\\{')
                 .replace(/\}/, '\\}');

  while (format.match(/%[udrhptm]/) !== null) {
    var match = format.match(/%[udrhptm]/);
    format = format.replace(match, regexps[match][1]);
    obj_keys.push(regexps[match][0]);
  }

  regex = new RegExp(format+regexBase);

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
  });
  parser(content.join(''));
  return objs;
}

function parser(data) {
  const matches = data.match(regex);
  if (matches !== null) {
    var obj = {};
    for (var i = 0; i < obj_keys.length; i++) {
      obj[obj_keys[i]] = matches[i+1];
    }
    obj['duration'] = matches[obj_keys.length+1];
    obj['query'] = matches[obj_keys.length+2];
    objs.push(obj);
  }
}

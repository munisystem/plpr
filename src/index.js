'use strict';

const moment = require('moment');

const regexBase = 'LOG:  duration: (\\d+\\.\\d+) ms  (execute|statement).*: (.+)?';
const regexps = {
  '%u': ['user', '([0-9a-zA-Z\\.\\-\\_\\[\\]]*)?'],
  '%d': ['dbname', '([0-9a-zA-Z\\.\\-\\_\\[\\]]*)?'],
  '%r': ['hostport', '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\(\\d+\\))?'],
  '%h': ['host', '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})?'],
  '%p': ['pid', '(\\d+)*'],
  '%t': ['time', '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} \\D{3})'],
  '%m': ['time', '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d* \\D{3})'],
};

const numParams = ['pid'];

module.exports = (data, format) => {
  let objs = [];
  let obj_keys = [];
  let regex = null;

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
    let match = format.match(/%[udrhptm]/);
    format = format.replace(match, regexps[match][1]);
    obj_keys.push(regexps[match][0]);
  }

  regex = new RegExp(format+regexBase);

  const lines = data.split(/\r\n|\r|\n/);

  let content = [];
  lines.forEach(line => {
    if (line.includes(':  ')) {
      if (content.length == 0) {
        content.push(line);
        return;
      } else {
        parser(content.join(''), objs, obj_keys, regex);
        content = [];
      }
      content.push(line);
    }
  });
  parser(content.join(''), objs, obj_keys, regex);
  return objs;
}

function parser(data, objs, obj_keys, regex) {
  const matches = data.match(regex);
  if (matches !== null) {
    let obj = {};
    let duration = Number(matches[obj_keys.length+1]);
    let query = matches[obj_keys.length+3];

    for (let i = 0; i < obj_keys.length; i++) {
      let key = obj_keys[i];
      let value = matches[i+1];

      if (key === "time") {
        obj['time'] = value;
      } else if (numParams.indexOf(key) >= 0) {
        obj[key] = Number(value);
      } else {
        obj[key] = value;
      }
    }

    obj['duration'] = duration;
    obj['query'] = query;
    objs.push(obj);
  }
}

'use strict';

const moment = require('moment');

const regexBase = 'LOG:  duration: (\\d+\\.\\d+) ms  (execute|statement).*: (.+)?';
const regexps = {
  '%u': ['user', '([0-9a-zA-Z\\.\\-\\_\\[\\]]*)?'],
  '%d': ['dbname', '([0-9a-zA-Z\\.\\-\\_\\[\\]]*)?'],
  '%r': ['hostport', '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\(\\d+\\))?'],
  '%h': ['host', '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})?'],
  '%p': ['pid', '(\\d+)*'],
  '%t': ['endtime', '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} \\D{3})'],
  '%m': ['endtime', '(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d* \\D{3})'],
};

const numParams = ['pid'];

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
    var duration = Number(matches[obj_keys.length+1]);
    var query = matches[obj_keys.length+3];

    for (var i = 0; i < obj_keys.length; i++) {
      var key = obj_keys[i];
      var value = matches[i+1];

      if (key === "endtime") {
        var endtime = Date.parse(value);
        var starttime = endtime - duration;
        obj['starttime'] = moment(starttime).format();
        obj['endtime'] = moment(endtime).format();
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

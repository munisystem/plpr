# pspl
PostgreSQL query log parser.

## Install
```
$ npm install --save plpr
```

## Usage
```js
'use strict';
const plpr = require('plpr');

const logLineFormat = "[%m] %h:%d ";
const logLine = `[2007-09-01 16:44:49.244 UTC] 192.168.2.10:ossecdb LOG:  duration: 4.550 ms  statement: SELECT id FROM location WHERE name = 'enigma->/var/log/messages' AND server_id = '1'`;

console.log(plpr(logLine, logLineFormat));
/*
[ { starttime: '2007-09-02T01:44:49+09:00',
    endtime: '2007-09-02T01:44:49+09:00',
    host: '192.168.2.10',
    dbname: 'ossecdb',
    duration: 4.55,
    query: 'SELECT id FROM location WHERE name = \'enigma->/var/log/messages\' AND server_id = \'1\'' } ]
*/
```

## Support PostgreSQL log format
|Object Key (value type)|Description|log_line_prefix escape|
|:-----|:-----|:-----|
|user (string)|User name|%u|
|dbname (string)|Database name|%d|
|hostport (string)|Remote IP address and remote port|%r|
|host (string)|Remote IP address|%h|
|pid (number)|Process ID|%p|
|starttime (string)|Timestamp of query start (subtract query end time from duration)|%t, %m|
|endtime (string)|Timestamp of query end |%t, %m|
|duration (float)|Duration executing query (milliseconds)|(AUTO)|
|query (string)|Query|(AUTO)|

Please check your PostgreSQL cofig `log_line_prefix` .

## License
MIT © munisystem

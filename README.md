# pspl
PostgreSQL query log parser.

## Install
```
$ npm install --save plpr
```

## Usage
```js
'use strict';

const fs = require('fs');
const plpr = require('./lib/index');

fs.readFile('./psql.log', 'utf8', (err, text) => {
  console.log(plpr(text));
  /*
  [{ timestamp: '2017-04-05 10:00:00 UTC',
    duration: '122.144',
    query: 'SELECT * FROM "animals"'
  }]
  */
});
```

## Support PostgreSQL log format
pspl can parse logfile only below prefixies.
- timestamp (%t, %m)

Please check your PostgreSQL cofig `log_line_prefix` .

TBD.

## License
MIT © munisystem

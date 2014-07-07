logfilestream [![Build Status](https://secure.travis-ci.org/node-modules/logstream.svg)](http://travis-ci.org/node-modules/logstream) [![Coverage Status](https://coveralls.io/repos/node-modules/logstream/badge.svg)](https://coveralls.io/r/node-modules/logstream)
=========

[![NPM](https://nodei.co/npm/logfilestream.svg?downloads=true&stars=true)](https://nodei.co/npm/logfilestream)

![logo](https://raw.github.com/fengmk2/logstream/master/logo.png)

Log file stream, including auto rolling feature, support multiprocess `append` write at the same time.

## Install

```sh
$ npm install logfilestream
```

## Usage

```js
var writestream = logfilestream({
  logdir: '/tmp/logs',
  nameformat: '[info.]YYYY-MM-DD[.log]'
});

writestream.write('hello');
writestream.write(' world\n');
writestream.end();
```

## Options

```
/**
 * Log stream, auto cut the log file.
 *
 * log file name is concat with `prename + format + ext`.
 *
 * @param  {Object} options
 *  - {String} logdir, this dir must exists.
 *  - {String} nameformat, default is '[info.]YYYY-MM-DD[.log]',
 *    @see moment().format(): http://momentjs.com/docs/#/displaying/format/
 *    Also support '{pid}' for process pid.
 *  - {Number} [duration], default is one houre(24 * 3600000 ms), must >= 60s.
 *  - {String} [mode], default is '0666'.
 *  - {Number} [buffer] buffer duration, default is 1000ms
 *  - {Boolean} [mkdir] try to mkdir in each cut, make sure dir exist.
 *    useful when your nameformat like 'YYYY/MM/DD/[info.log]'.
 * return {LogStream}
 */
```

## License

(The MIT License)

Copyright (c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

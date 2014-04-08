/**!
 * logstream - lib/logstream.js
 *
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var moment = require('moment');

var ONE_MINUTE = 60000;
var ONE_HOUR = 60 * ONE_MINUTE;
var ONE_DAY = 24 * ONE_HOUR;

/*!
 * Default log buffer duration.
 */
var defaultBufferDuration = 1000;

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
 *  - {String} [ext], default is '.log'.
 *  - {Number} [duration], default is one houre(24 * 3600000 ms), must >= 60s.
 *  - {String} [mode], default is '0666'.
 *  - {Number} [buffer] buffer duration, default is 1000ms
 * return {LogStream}
 */
module.exports = function createStream(options) {
  return new LogStream(options);
};

function LogStream(options) {
  if (!(this instanceof LogStream)) {
    return new LogStream(options);
  }
  options = options || {};
  this.logdir = options.logdir;
  this.nameformat = options.nameformat || '[info.]YYYY-MM-DD[.log]';
  this.nameformat = this.nameformat.replace('{pid}', process.pid);
  this.duration = options.duration || ONE_HOUR;
  // must >= one minute
  if (this.duration < 60000) {
    this.duration = 60000;
  }
  this.encoding = options.encoding || 'utf8';
  this.streamMode = options.mode || '0666';
  this.cut();
  this.startTimer(this.firstDuration());
  this._buf = [];
  this._flushInterval = options.buffer || defaultBufferDuration;
  setInterval(this._flush.bind(this), this._flushInterval);
}

util.inherits(LogStream, EventEmitter);

LogStream.prototype.firstDuration = function () {
  var firstDuration = this.duration;
  if (this.duration > ONE_MINUTE) {
    var now = moment();
    if (this.duration < ONE_HOUR) { // in minute
      firstDuration = now.clone().add('ms', this.duration).startOf('minute').diff(now);
    } else if (this.duration < ONE_DAY) { // in hour
      firstDuration = now.clone().add('ms', this.duration).startOf('hour').diff(now);
    } else { // in day
      firstDuration = now.clone().add('ms', this.duration).startOf('day').diff(now);
    }
  }
  return firstDuration;
};

LogStream.prototype.startTimer = function (duration) {
  this._timer = setTimeout(function (self) {
    self.cut();
    self.startTimer(self.duration);
  }, duration || this.duration, this);
};

LogStream.prototype.cut = function () {
  if (this.stream) {
    this._flush();
    this.stream.end();
    this.stream.destroySoon();
    this.stream = null;
  }
  var name = moment().format(this.nameformat);
  var logpath = path.join(this.logdir, name);
  this._reopening = true;
  this.stream = fs.createWriteStream(logpath, {flags: 'a', mode: this.streamMode});
  this.stream
    .on("error", this.emit.bind(this, "error"))
    .on("pipe", this.emit.bind(this, "pipe"))
    .on("drain", this.emit.bind(this, "drain"))
    .on("open", function () {
      this._reopening = false;
    }.bind(this))
    .on("close", function () {
      if (!this._reopening) {
        this.emit("close");
      }
    }.bind(this));
};

LogStream.prototype.write = function (string) {
  this._buf.push(string);
};

LogStream.prototype._flush = function () {
  if (this._buf.length) {
    this.stream.write(this._buf.join(''));
    this._buf.length = 0;
  }
};

LogStream.prototype.end = function () {
  if (this._timer) {
    clearTimeout(this._timer);
    this._timer = null;
  }
  if (this.stream) {
    this._flush();
    this.stream.end();
    this.stream.destroySoon();
    this.stream = null;
  }
};

LogStream.prototype.close = LogStream.prototype.end;

module.exports.LogStream = LogStream;

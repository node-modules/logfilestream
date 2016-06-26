'use strict';

var should = require('should');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var existsSync = fs.existsSync || path.existsSync;
var logstream = require('../');

var logdir = path.join(__dirname, 'logstream-test');

describe('logstream.test.js', function () {
  before(function (done) {
    exec(['rm -rf ' + logdir], function () {
      mkdirp(logdir, done);
    });
  });

  describe('createStream()', function () {
    it('should init and call this first cut() to create a writestream', function () {
      var stream = logstream({logdir: logdir});
      stream.duration.should.equal(3600000);
      stream.logdir.should.equal(logdir);
      stream.nameformat.should.equal('[info.]YYYY-MM-DD[.log]');
      stream.streamMode.should.equal('0666');
      stream.stream.path.should.equal(path.join(logdir,
        'info.' + moment().format('YYYY-MM-DD') + '.log'));
      stream.should.have.property('_reopening', true);
      stream.end();
      stream.should.have.property('stream', null);
    });

    it('should init format YYYY/MM/DD/[info.log] ok', function () {
      var stream = logstream({logdir: logdir, nameformat: 'YYYY/MM/DD/[info.log]', mkdir: true});
      stream.duration.should.equal(3600000);
      stream.logdir.should.equal(logdir);
      stream.nameformat.should.equal('YYYY/MM/DD/[info.log]');
      stream.streamMode.should.equal('0666');
      stream.stream.path.should.equal(path.join(logdir,
        moment().format('YYYY/MM/DD/') + 'info.log'));
      stream.should.have.property('_reopening', true);
      stream.end();
      stream.should.have.property('stream', null);
    })
  });

  describe('firstDuration()', function () {
    it('should default one hour when !duration', function () {
      var stream = logstream({logdir: logdir, prename: 'info.'});
      stream.firstDuration().should.below(3600000);
      stream.end();

      [0, null, undefined].forEach(function (d) {
        var stream = logstream({duration: d, logdir: logdir, prename: 'info.'});
        stream.firstDuration().should.below(3600000);
        stream.end();
      });
    });

    it('should return <= duration', function () {
      [1, 10, 100, 999, 59999, 60000].forEach(function (i) {
        var stream = logstream({ duration: i, logdir: logdir });
        stream.firstDuration().should.equal(60000);
        stream.end();
      });
      [60000 * 5, 60000 * 10, 60000 * 20,
        60000 * 30, 60000 * 59,
        3600000 * 1, 3600000 * 2, 3600000 * 3,
        3600000 * 5, 3600000 * 12, 3600000 * 24,
        3600000 * 24 * 3, 3600000 * 24 * 5, 3600000 * 24 * 7
      ].forEach(function (j) {
        var stream = logstream({ duration: j, logdir: logdir });
        stream.firstDuration().should.below(j);
        stream.end();
      });
    });
  });

  describe('startTimer()', function () {
    it('_timer should be change', function () {
      var stream = logstream({logdir: logdir});
      var oldtimer = stream._timer;
      oldtimer.should.be.ok;
      stream.startTimer();
      stream._timer.should.not.equal(oldtimer);
      stream.end();
    });
  });

  describe('cut()', function () {
    var old = logstream.LogStream.prototype.firstDuration;
    before(function () {
      logstream.LogStream.prototype.firstDuration = function () {
        return 1000;
      };
    });
    after(function () {
      logstream.LogStream.prototype.firstDuration = old;
    });

    it('should be cut when timeout', function (done) {
      var stream = logstream({
        duration: 1000,
        nameformat: 'YYYY-MM-DDhh:mm:ss[.log]',
        logdir: logdir
      });
      var line1 = 'now is ' + new Date() + '|\n';
      stream.write(line1);
      stream.write(line1);
      var lastStream = stream.stream;
      setTimeout(function () {
        fs.readFileSync(lastStream.path, 'utf8').should.equal(line1 + line1);
        existsSync(stream.stream.path).should.be.true;
        stream.stream.path.should.not.equal(lastStream.path);
        var filepath = stream.stream.path;
        fs.readFileSync(stream.stream.path, 'utf8').should.equal('');
        stream.write(line1);
        stream.on('close', function () {
          fs.readFileSync(filepath, 'utf8').should.equal(line1 + line1 + line1);
          done();
        });
        stream.write(line1);
        stream.write(line1);
        stream.end();
        stream.should.have.property('_timer', null);
        stream.should.have.property('stream', null);
      }, 1500);
    });
  });

  describe('end()', function() {
    it('will clear timer and flush timer', function() {
      var stream = logstream({logdir: logdir});

      stream.should.have.property('_timer').be.a.Object;
      stream.should.have.property('_flushTimer').be.a.Object;

      stream.end();

      stream.should.have.property('_timer', null);
      stream.should.have.property('_flushTimer', null);
    });

  });
});

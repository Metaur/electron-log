'use strict';

var expect  = require('chai').expect;
var fs      = require('fs');
var os      = require('os');
var path    = require('path');
var factory = require('./index');

describe('file transport', function () {
  var tmpId = 'electron-log-' + Math.random().toString(36).substring(2, 15);
  var logFile = path.join(os.tmpdir(), tmpId + '.log');
  var olgLogFile = path.join(os.tmpdir(), tmpId + '.old.log');

  afterEach(function () {
    try {
      fs.unlinkSync(logFile);
      fs.unlinkSync(olgLogFile);
    } catch (e) {
      // Just skip, after some test file doesn't exist
    }
  });

  it('should archive old log', function () {
    var electronLog = {};
    var msg = {
      data: ['test log'],
      date: new Date(),
      level: 'info',
      variables: electronLog.variables
    };
    var transport = factory(electronLog);
    transport.maxSize = 20;
    transport.file = logFile;
    transport.sync = true;

    transport(msg);
    expect(transport.bytesWritten).to.equal(42);
    expect(fs.existsSync(olgLogFile)).to.equal(false);

    msg.data = ['test log 2'];
    transport(msg);
    expect(transport.bytesWritten).to.equal(44);
    expect(fs.existsSync(olgLogFile)).to.equal(true);
    expect(fs.statSync(logFile).size).to.equal(44);
    expect(fs.statSync(olgLogFile).size).to.equal(42);
  });
});

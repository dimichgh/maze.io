'use strict';

var Assert = require('assert');
var Path = require('path');
var Wreck = require('wreck');
var Cp = require('child_process');
var Bootstrap = require('../lib/bootstrap');
var Fetcher = require('../stats/fetcher');
var Members = require('../members');

describe(__filename, function () {
    var base;
    before(function () {
        base = require('seneca')()
          .use('mesh',{
              base:true,
              model: 'actor'
          });
    });

    after(function () {
        base.close();
    });

    it('should bootsrap app', function (done) {
        process.once('online', function (msg) {
            Wreck.get('http://localhost:'+ msg.port +'/hello', function (err, res, payload) {
                Assert.ok(!err, err);
                Assert.equal(200, res.statusCode);
                Assert.equal('{"greetings":"hello"}', payload.toString());
                done();
            });
        });

        Bootstrap.start({
            name: Path.resolve(__dirname, 'fixtures/bootstrap/app')
        });

    });

    it('should provide stats cpu', function (done) {

        setTimeout(function () {
            Fetcher.get('cpu', function (err, stats) {
                Assert.ok(!err, err);
                Assert.ok(stats);
                Assert.ok(stats.length);
                Assert.ok(stats[0].memory !== undefined);
                Assert.ok(stats[0].cpu !== undefined);
                done();
            });
        }, 3000);

    });

    it('should get all members', function (done) {
        Members.all(function (err, members) {
            Assert.ok(!err, err);
            Assert.ok(members.length);
            done();
        });
    });

    it('should get stats members', (done) => {
        Members.for((member) => {
            return /role:stats/.test(member.pin);
        },
        (err, members) => {
            console.log(members);
            Assert.ok(!err, err);
            Assert.equal(4, members.length);
            done();
        });
    });

    describe('external process', function () {
        var app;

        before(next => {
            this.timeout(15000);
            var cmd = Path.resolve(__dirname, '../index.js');

            app = Cp.fork(cmd, [Path.resolve(__dirname,
                'fixtures/bootstrap/app.js')]);
            app.on('message', function masterHandle(msg) {
                console.log(msg);
                if (msg === 'online') {
                    setTimeout(next, 3000);
                }
            });

        });

        after(() => {
            app.kill();
        });

        it('should get cpu stats for internal and one external process', function (done) {
            Fetcher.get('cpu', function (err, stats) {
                Assert.ok(!err, err);
                Assert.ok(stats);
                Assert.equal(2, stats.length);
                Assert.ok(stats[0].memory !== undefined);
                Assert.ok(stats[0].cpu !== undefined);
                Assert.ok(stats[1].memory !== undefined);
                Assert.ok(stats[1].cpu !== undefined);
                done();
            });

        });
    });
});

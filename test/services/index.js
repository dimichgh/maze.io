'use strict';

const Assert = require('assert');
const _ = require('lodash');
const RequestLocal = require('request-local');
const Services = require('../../services');

describe(__dirname, function () {

    createSuite('local binding');



});

function createSuite(name, configuration) {
    describe(name, function () {
        it('should create service and invoke it', function (done) {
            var services = Services();

            services.service({
                name: 'foo'
            }, function action(args, done) {
                done(null, ['hi']);
            }).ready(function () {
                services.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hi'], data);
                    done();
                });

            });
        });

        it('should create service and invoke it with context', function (done) {
            var services = Services({});

            services.service({
                name: 'foo'
            }, function action(args, done) {
                Assert.deepEqual({parent:null,bar:'qaz'}, RequestLocal.data);
                done(null, _.pick(args, ['name', 'type', 'ctx']));
            }).ready(function () {
                services.context({
                    bar: 'qaz'
                }).request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual({
                        name: 'foo',
                        type: 'service',
                        ctx: {
                            bar: 'qaz'
                        }
                    }, data);                done();
                });

            });
        });

        it('should create service and invoke it with implicit context', function (done) {
            var services = Services({});

            services.service({
                name: 'foo'
            }, function action(args, done) {
                Assert.deepEqual({parent:null, qaz:'wsx'}, RequestLocal.data);
                done(null, _.pick(args, ['name', 'type', 'ctx']));
            }).ready(function () {

                RequestLocal.run(function onCtx(err, ctx) {
                    ctx.qaz = 'wsx';

                    services.request({
                        name: 'foo'
                    }, function (err, data) {
                        Assert.deepEqual({
                            name: 'foo',
                            type: 'service',
                            ctx: {
                                parent: null,
                                qaz: 'wsx'
                            }
                        }, data);
                        done();
                    });

                });

            });
        });

        it('should create service, override it and invoke it', function (done) {
            var services = Services();

            services
            .service({
                name: 'foo'
            }, function action(args, done) {
                done(null, ['hi']);
            })
            .service({
                name: 'foo'
            }, function action(args, done) {
                done(null, ['hello']);
            })
            .ready(function () {
                services.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hello'], data);
                    done();
                });

            });
        });

        it('should create service, override it and invoke both with fallback', function (done) {
            var services = Services();

            services
            .service({
                name: 'foo'
            }, function action(args, done) {
                done(null, ['hi']);
            })
            .service({
                name: 'foo'
            }, function action(args, done) {
                this.prior(args, function (err, data) {
                    data.push('hello');
                    done(null, data);
                });
            })
            .ready(function () {
                services.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hi', 'hello'], data);
                    done();
                });

            });
        });

        it('should fail to invoke non-matching service', function (done) {
            var services = Services();

            services.service({
                other: 'service'
            }, function action(args, done) {
                done(null, ['hi']);
            }).ready(function () {
                services.request({
                    name: 'foo'
                }, function (err) {
                    Assert.ok(err);
                    Assert.ok(err.message.indexOf('No matching action pattern found') !== -1);
                    done();
                });

            });
        });

    });
}

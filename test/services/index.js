'use strict';

const RequestLocal = require('request-local');
const Assert = require('assert');
const _ = require('lodash');
const Seneca = require('seneca');

describe(__dirname, function () {

    createSuite('local binding');


    describe('mesh: one local and one remote service', function () {
        it('should fail to invoke non-matching service', function (done) {

            Seneca({
                mesh: {
                    base: true,
                    model: 'actor'
                }
            });

            Seneca({
                mesh: {
                    auto:true,
                    listen: [
                        {
                            pin: 'name:s2',
                            model: 'consume'
                        }
                    ]
                }
            })
            .use('../../services', {})
            .service({
                name: 's2'
            }, function action(args, done) {
                done(null, ['hi']);
            });

            Seneca({
                mesh: {
                    auto:true,
                    listen: [
                        {
                            pin: 'name:s1',
                            model: 'consume'
                        }
                    ]
                }
            })
            .use('../../services', {})
            .service({
                name: 's1'
            }, function action(args, done) {
                done(null, ['hello']);
            });

            var servicesRemote = Seneca({
                mesh: {
                    auto:true
                }
            })
            .use('../../services', {})
            .service({
                name: 'foo'
            }, function action(args, done) {
                done(null, ['hi']);
            });


            servicesRemote.ready(() => {
                servicesRemote.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hi'], data);
                    done();
                });
            });

        });

    });
});

function createSuite(name, configuration) {
    describe(name, function () {
        it('should create service and invoke it', function (done) {
            var seneca = Seneca();
            seneca.use('../../services', {
                services: {
                    foo: {
                        service: function (args, done) {
                            done(null, ['hi']);
                        }
                    }
                }
            })
            .ready(function () {
                let seneca = this;
                seneca.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hi'], data);
                    done();
                });
            });
        });

        it('should create service and invoke it with context', function (done) {
            var seneca = Seneca();

            seneca.use('../../services', {
                services: {
                    foo: {
                        service: function (args, done) {
                            Assert.deepEqual({parent:null,bar:'qaz'}, RequestLocal.data);
                            done(null, _.pick(args, ['name', 'type', 'ctx']));
                        }
                    }
                }
            })
            .ready(function () {
                seneca.setContext({
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
                    }, data);
                    done();
                });

            });
        });

        it('should create service and invoke it with implicit context', function (done) {
            var seneca = Seneca({});
            seneca.use('../../services', {
                services: {
                    foo: {
                        service: function (args, done) {
                            Assert.deepEqual({parent:null, qaz:'wsx'}, RequestLocal.data);
                            done(null, _.pick(args, ['name', 'type', 'ctx']));
                        }
                    }
                }
            })
            .ready(function () {
                let seneca = this;

                RequestLocal.run(function onCtx(err, ctx) {
                    ctx.qaz = 'wsx';

                    seneca.request({
                        name: 'foo'
                    }, function (err, data) {
                        Assert.ok(!err, err && err.stack);
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
            var seneca = Seneca({});
            seneca.use('../../services', {})
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
                seneca.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hello'], data);
                    done();
                });

            });
        });

        it('should create service, override it and invoke both with fallback', function (done) {
            var seneca = Seneca({});
            seneca.use('../../services', {})
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
                seneca.request({
                    name: 'foo'
                }, function (err, data) {
                    Assert.deepEqual(['hi', 'hello'], data);
                    done();
                });

            });
        });

        it('should fail to invoke non-matching service', function (done) {
            var seneca = Seneca({});
            seneca.use('../../services', {})
            .service({
                other: 'service'
            }, function action(args, done) {
                done(null, ['hi']);
            }).ready(function () {
                seneca.request({
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

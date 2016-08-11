'use strict';

const Assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const Pipe = require('../../pipe');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

describe(__filename, function () {
    it('should create request pipe and execute it', done => {
        let first = async (ctx => {
            ctx.request.foo = '-foo';
            await (new Promise(resolve => setTimeout(() => {
                ctx.request.foo = '+foo';
                resolve();
            }, 200)));
        });

        let second = async (function second(ctx) {
            ctx.request.bar = '-bar';
            await (new Promise(resolve => setTimeout(() => {
                ctx.request.bar = '+bar';
                resolve();
            }, 100)));
        });

        Pipe.createPipe([
            {
                request: first
            },
            {
                request: second
            }
        ])({}).then(function (context) {
            console.log('done: ', context);
            Assert.deepEqual({
                request: {
                    foo: '+foo',
                    bar: '+bar'
                },
                response: {}
            }, context);
            done();
        }).catch(done);
    });

    it('should create response pipe and execute it', done => {
        let first = async (ctx => {
            ctx.response.foo = '-foo';
            await (new Promise(resolve => setTimeout(() => {
                ctx.response.foo = '+foo';
                resolve();
            }, 200)));
        });

        let second = async (function second(ctx) {
            ctx.response.bar = '-bar';
            await (new Promise(resolve => setTimeout(() => {
                ctx.response.bar = '+bar';
                resolve();
            }, 100)));
        });

        Pipe.createPipe([
            {
                response: first
            },
            {
                response: second
            }
        ])({}).then(function (context) {
            console.log('done: ', context);
            Assert.deepEqual({
                request: {},
                response: {
                    foo: '+foo',
                    bar: '+bar',
                }
            }, context);
            done();
        }).catch(done);
    });

    it('should create request/response pipe and execute it', done => {

        function createHander(name) {
            return {
                request: async (ctx => {
                    ctx.request[name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.request[name] = '+' + name;
                        resolve();
                    }, 200)));
                }),
                response: async (ctx => {
                    ctx.response['r-' + name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.response['r-' + name] = '+' + name;
                        resolve();
                    }, 200)));
                })
            };
        }

        Pipe.createPipe([
            createHander('foo'),
            createHander('bar')
        ])({}).then(function (context) {
            console.log('done: ', context);
            Assert.deepEqual({
                request: {
                    foo: '+foo',
                    bar: '+bar'
                },
                response: {
                    'r-bar': '+bar',
                    'r-foo': '+foo'
                }
            }, context);
            done();
        }).catch(done);
    });

    it('should handle request/response pipe and customize response', done => {

        function createHander(name, custom) {
            return {
                request: async (ctx => {
                    ctx.request[name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.request[name] = '+' + name;
                        resolve();
                    }, 200)));
                }),
                response: async (ctx => {
                    if (custom) {
                        ctx.response = custom;
                        return;
                    }
                    ctx.response['r-' + name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.response['r-' + name] = '+' + name;
                        resolve();
                    }, 200)));
                })
            };
        }

        Pipe.createPipe([
            createHander('foo'),
            createHander('bar', {
                custom: 'qaz'
            })
        ])({}).then(function (context) {
            console.log('done: ', context);
            Assert.deepEqual({
                request: {
                    foo: '+foo',
                    bar: '+bar'
                },
                response: {
                    'r-foo': '+foo',
                    custom: 'qaz'
                }
            }, context);
            done();
        }).catch(done);
    });

    it('should catch error in request flow', done => {

        function createHander(name, error) {
            return {
                request: async (ctx => {
                    if (error) {
                        throw new Error(error);
                    }
                    ctx.request[name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.request[name] = '+' + name;
                        resolve();
                    }, 200)));
                }),
                response: async (ctx => {
                    ctx.response['r-' + name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.response['r-' + name] = '+' + name;
                        resolve();
                    }, 200)));
                })
            };
        }

        Pipe.createPipe([
            createHander('foo'),
            createHander('bar', 'Test error'),
            createHander('wsx')
        ])({})
        .then(function (context) {
            done(new Error('Should not reach this'));
        })
        .catch(err => {
            Assert.equal('Test error', err.message);
            done();
        });
    });

    it('should catch error in response flow', done => {

        function createHander(name, error) {
            return {
                request: async (ctx => {
                    ctx.request[name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.request[name] = '+' + name;
                        resolve();
                    }, 200)));
                }),
                response: async (ctx => {
                    if (error) {
                        throw new Error(error);
                    }
                    ctx.response['r-' + name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.response['r-' + name] = '+' + name;
                        resolve();
                    }, 200)));
                })
            };
        }

        Pipe.createPipe([
            createHander('foo'),
            createHander('bar', 'Test error'),
            createHander('wsx')
        ])({}).then(function () {
            done(new Error('Should not reach this'));
        }).catch(err => {
            Assert.equal('Test error', err.message);
            done();
        });
    });

    it('should produce chunked response', done => {

        function createHander(name) {
            return {
                request: async (ctx => {
                    ctx.request[name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.request[name] = '+' + name;
                        resolve();
                    }, 200)));
                }),
                response: async (ctx => {
                    ctx.response['r-' + name] = '-' + name;
                    await (new Promise(resolve => setTimeout(() => {
                        ctx.response['r-' + name] = '+' + name;
                        resolve();
                    }, 200)));
                })
            };
        }

        Pipe.createPipe([
            createHander('foo'),
            createHander('bar', 'Test error'),
            createHander('wsx'),
            {
                request: async(function chunked(ctx) {
                    let counter = 0;
                    ctx.response = new EventEmitter();

                    function emitChunk() {
                        ctx.response.emit('chunk', {
                            chunk: counter
                        });
                        if (counter++ > 3) {
                            ctx.response.emit('end');
                            return;
                        }
                        setTimeout(emitChunk, 200);
                    }

                    setImmediate(emitChunk);
                })
            }
        ])({}).then(function (context) {
            let chunkCounter = 0;
            let responseEmitter = context.response;
            Assert.ok(responseEmitter instanceof EventEmitter);
            responseEmitter.on('chunk', chunk => {
                chunkCounter++;
                console.log('chunk: ', chunk);
            });
            responseEmitter.once('error', err => {
                done(err);
            });
            responseEmitter.once('end', () => {
                Assert.equal(5, chunkCounter);
                done();
            });
        }).catch(done);
    });
});

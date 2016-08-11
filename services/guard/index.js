'use strict';

const Domain = require('domain');

module.exports.service = function serviceFactory(options, next) {
    var seneca = this;
    let uncaughtErrorHandler = options.uncaughtErrorHandler ||
        createDefaultHandler();

    if (typeof uncaughtErrorHandler === 'string') {
        // assume it is path to the module that exports function
        uncaughtErrorHandler = require(uncaughtErrorHandler);
    }

    return function service(pattern, action) {
        let seneca = this;
        let domain = Domain.create();
        domain.once('error', uncaughtErrorHandler.bind(seneca));
        domain.run(function runInCtx() {            
            next.call(seneca, pattern, action);
        });
    };

    function createDefaultHandler() {
        return function defaultHandler(err) {
            seneca.log.error('Uncaught error', err);
            process.exit(1);
        };
    }
};

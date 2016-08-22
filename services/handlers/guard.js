'use strict';

const Domain = require('domain');

module.exports = function guardFactory(options) {
    return function attachGuardContext(request, next) {

        var seneca = this;
        var uncaughtErrorHandler = options.uncaughtErrorHandler ||
            createDefaultHandler();

        if (typeof uncaughtErrorHandler === 'string') {
            // assume it is path to the module that exports function
            uncaughtErrorHandler = require(uncaughtErrorHandler);
        }

        let domain = Domain.create();
        domain.once('error', uncaughtErrorHandler.bind(seneca));
        domain.run(function runInCtx() {
            seneca.prior(request, next);
        });

        function createDefaultHandler() {
            return function defaultHandler(err) {
                this.log.error('Uncaught error', err);
                process.exit(1);
            };
        }
    };
};

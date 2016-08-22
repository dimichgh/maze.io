'use strict';

const RequestLocal = require('request-local');
const _ = require('lodash');

module.exports = function contextFactory(options) {
    return function attachContext(request, next) {
        var seneca = this;

        if (request.ctx) {
            RequestLocal.run((err, ctx) => {
                if (err) {
                    this.log.error(err);
                }
                else {
                    _.assignIn(ctx, request.ctx);
                }

                seneca.prior(request, next);
            });
            return;
        }

        seneca.prior(request, next);
    };
};

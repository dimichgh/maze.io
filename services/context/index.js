'use strict';

const RequestLocal = require('request-local');
const _ = require('lodash');

module.exports = {
    service: function serviceFactory(options, next) {
        return function service(pattern, action) {
            let seneca = this;

            if (pattern.ctx) {
                RequestLocal.run((err, ctx) => {
                    if (err) {
                        this.log.error(err);
                    }
                    else {
                        _.assignIn(ctx, pattern.ctx);
                    }

                    next.call(seneca, pattern, action);
                });
                return;
            }
            next.call(seneca, pattern, action);
        };
    }
};

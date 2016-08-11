'use strict';

const Assert = require('assert');
const Seneca = require('seneca');
const _ = require('lodash');
const RequestLocal = require('request-local');
const tryRequire = require('try-require');

const DEFAULT_INSTRUMENTS = {
    gate: {
        module: require.resolve('./guard'),
        options: {}
    },
    context: {
        module: require.resolve('./context'),
        options: {}
    }
};

function Services(seneca) {
    this.seneca = seneca;
}

Services.prototype = {

    implicitContext: function implicitContext() {
        try {
            return RequestLocal.data;
        }
        catch (err) {
            this.seneca.log.warn(err);
            return {};
        }
    },

    service: function service(pattern, action) {
        let seneca = this.seneca;
        let instruments = pattern.instruments || DEFAULT_INSTRUMENTS;
        pattern = _.assignIn({
            type: 'service'
        }, pattern);

        // create pipeline if any or use default
        if (instruments) {
            action = Object.keys(instruments)
                .reverse()
                .reduce((next, name) => {
                    let instrument = instruments[name];
                    let instrumentAction = instrument.module;
                    if (typeof instrumentAction === 'string') {
                        instrumentAction = tryRequire(instrumentAction);
                    }
                    Assert.ok(instrumentAction,
                        `Failed to find ${name} instrument ${instruments.module}`);

                    if (instrumentAction.service) {
                        return instrumentAction
                            .service(instrument.options,
                                next);
                    }

                    return action;
                }, action);
        }

        seneca.add(pattern, action);

        return this;
    },

    client: function client(options) {
        this.seneca.client(options);
        return this;
    },

    /*
     * Create context
    */
    context: function context(ctx) {
        let delegate = this.seneca.delegate();
        delegate.context = _.clone(ctx);
        return new Services(delegate);
    },

    request: function request(request, callback) {
        request = _.assignIn({}, {
            type: 'service',
            ctx: _.isEmpty(this.seneca.context) ?
                this.implicitContext() :
                this.seneca.context
        }, request);

        this.seneca.act(request, callback);
    },

    ready: function ready(callback) {
        this.seneca.ready(callback);
    },

    close: function close(callback) {
        this.seneca.close(callback);
    }
};

module.exports = function factory(options) {
    options = options = {};
    let seneca = Seneca(options.meta);

    if (options.server && options.server.port) {
        seneca.listen(options.server.port);
    }

    if (options.plugins) {
        Object.keys(options.plugins).forEach(name => {
            let pluginOptions = options.plugins[name];
            seneca.use(name, pluginOptions);
        });
    }

    let services = new Services(seneca, options);

    if (options.services) {
        Object.keys(options.services).forEach(name => {
            let serviceOptions = options.services[name];
            if (typeof serviceOptions.handler === 'string') {
                // assume it is the module
                serviceOptions.handler = require(serviceOptions.handler);
            }
            services.service(serviceOptions.pattern, serviceOptions.handler);
        });
    }

    if (options.clients) {
        Object.keys(options.clients).forEach(name => {
            let clientOptions = options.clients[name];
            services.client(clientOptions);
        });
    }

    return services;

};

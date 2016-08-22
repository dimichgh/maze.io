'use strict';

const Assert = require('assert');
const _ = require('lodash');
const RequestLocal = require('request-local');

const PLUGIN_NAME = 'maze-services';
const DEFAULT_HANDLERS = {
    guard: {
        handler: require.resolve('./handlers/guard'),
        options: {}
    },
    context: {
        handler: require.resolve('./handlers/context')
    }
};

/*
 * Defines main services plugin
 *  Options:
 *      - services - defines services.
 *          Services options may define handlers
 *          Example:
 *              {
 *                  service: "path to service module"
 *                  handlers: ["./foo", "./bar"]
 *              }
 *          Handlers will be executed locally before the main call
 *          Handlers should ne defined in pipeline section
 *      - clients - defines seneca clients
 *      - pipeline - defines handlers to be used in pipeline flow,
 *          see handler definition below
*/
module.exports = function servicesPlugin(options) {
    let seneca = this;
    options = options || {};

    if (options.server && options.server.port) {
        seneca.listen(options.server.port);
    }

    if (!seneca.options().plugin[PLUGIN_NAME]) {
        seneca.options().plugin[PLUGIN_NAME] = options;
    }

    /*
     * Pipeline configuration defines
    */
    var handlers = DEFAULT_HANDLERS;
    if (options.handlers) {
        handlers = _.assignIn({}, handlers, options.handlers);
    }

    Object.keys(handlers).forEach(name => {
        let handlerOptions = handlers[name] = handlers[name] || {};
        let handlerFactory = handlerOptions.handler;
        if (typeof handlerFactory === 'string') {
            // assume it is the module
            handlerFactory = require(handlerFactory);
        }
        handlerOptions.fn = handlerFactory(handlerOptions.options);
    });

    options.handlers = handlers;

    if (options.services) {
        Object.keys(options.services).forEach(name => {
            let serviceOptions = options.services[name];
            let service = serviceOptions.service;
            if (typeof service === 'string') {
                // assume it is the module
                service = require(service);
            }
            let meta = serviceOptions.meta || {
                name: name,
                version: serviceOptions.version
            };
            seneca.service(meta, service);
        });
    }


    if (options.clients) {
        Object.keys(options.clients).forEach(name => {
            let clientOptions = options.clients[name];
            seneca.client(clientOptions);
        });
    }

    return {
        name: PLUGIN_NAME
    };

};

module.exports.preload = function servicesPreload() {
    let seneca = this;

    /*
     * Define a service that supports pipeline handlers.
     * By default it provides guard against uncaught errors and context handlers
    */
    seneca.decorate('service', function defineService(pattern, action) {
        Assert.ok(!pattern.type || pattern.type === 'service',
            'you should not use type attribute for service defincitions as it is already taken');

        let seneca = this;

        seneca.ready(() => {
            let options = seneca.options();
            let pluginOptions = options.plugin[PLUGIN_NAME] || {};
            let services = pluginOptions.services || {};
            let handlers = pluginOptions.handlers;

            let serviceName = pattern.name;
            let serviceOptions = services[serviceName] || {};

            pattern = _.assignIn({
                type: 'service'
            }, pattern);

            seneca.add(pattern, action);

            // second we need to pass it through a pipeline of handlers
            // hence create a pipeline request
            let pipeline = serviceOptions.handlers === false ? [] :
                serviceOptions.handlers || Object.keys(DEFAULT_HANDLERS);

            pipeline.reverse().map(name => {
                let handlerOptions = handlers[name];
                Assert.ok(handlerOptions,
                    `Cannot find handler "${name}" for the service with pattern: ${JSON.stringify(pattern)}`);

                seneca.add(pattern, handlerOptions.fn);
            });
        });

        return this;
    });

    /*
     * Modified request that implicitly adds service type
    */
    seneca.decorate('request', function makeRequest(request, action) {

        Assert.ok(!request.type || request.type === 'service',
            'you should not use type attribute for requests as it is already taken');

        request = _.assignIn({}, {
            type: 'service',
            ctx: _.isEmpty(this.context) ?
                this.implicitContext() :
                this.context
        }, request);

        this.act(request, action);

        return this;
    });

    seneca.decorate('setContext', function useContext(ctx) {

        let delegate = this.delegate();
        delegate.context = _.clone(ctx);

        return delegate;
    });

    seneca.decorate('implicitContext', function implicitContext() {
        try {
            return RequestLocal.data;
        }
        catch (err) {
            this.log.warn(err);
            return {};
        }
    });

    return {
        name: PLUGIN_NAME
    };
};

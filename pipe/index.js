'use strict';

const EventEmitter = require('events').EventEmitter;
const stringify = require('fast-safe-stringify');
const await = require('asyncawait/await');
const async = require('asyncawait/async');

module.exports.createPipe = function createPipe(handlers) {
    return async (function exec(context) {
        context = context || {};
        context.request = context.request ?
            JSON.parse(stringify(context.request)) :
            {};

        // run request flow
        for (var i = 0; i < handlers.length; i++) {
            let handler = handlers[i];
            if (!handler.request) {
                continue;
            }
            await (handler.request(context));
            if (context.response) {
                break;
            }
        }

        context.response = context.response || {};

        let processChunk = async(function processChunk(context) {
            // run response flow backward
            for (i--;i >= 0; i--) {
                let handler = handlers[i];
                if (!handler.response) {
                    continue;
                }
                await (handler.response(context));
            }

            return context;
        });

        // whenever it needs to produce chunks, it would return event emitter
        // to emit chunk it would emit 'chunk' event
        // to signal the end of chunk it woudll emit 'end' event
        // to signal error it would emit error event
        if (context.response instanceof EventEmitter) {
            let emitter = context.response;
            let responseEmitter = new EventEmitter();

            process.domain && process.domain.add(emitter);

            emitter.on('chunk', chunk => {
                processChunk(chunk)
                .then(responseEmitter.on.bind(responseEmitter, 'chunk'))
                .catch(responseEmitter.on.bind(responseEmitter, 'error'));
            });
            emitter.on('end', responseEmitter.on.bind(responseEmitter, 'end'));
            emitter.on('error', responseEmitter.on.bind(responseEmitter, 'error'));

            context.response = responseEmitter;

            return context;
        }
        else {
            return await (processChunk(context));
        }

    });
};

'use strict';

const Assert = require('assert');
const Seneca = require('seneca');

const COMMANDS = {
    keys: 'role:state,action:keys',
    get: 'role:state,action:get',
    set: 'role:state,action:set'
};

/*
 * Provider interface:
 * - get(key:string, callback)
 * - set(key:string, value:object, callback)
 * - keys(filterRegex, callback)
*/
module.exports = function stateFactory(options, callback) {
    callback = callback || () => {};
    Assert.ok(options.provider, 'Provider is missing');
    let provider = typeof options.provider === 'string' ?
        require(options.provider) :
        options.provider;

    Seneca()
    .add(COMMANDS.get, (msg, cb) => {
        provider.get(msg.key, cb);
    })
    .add(COMMANDS.keys, (msg, cb) => {
        provider.keys(msg.filterRegex, cb);
    })
    .add(COMMANDS.set, (msg, cb) => {
        provider.set(msg.key, msg.value, cb);
    })
    .use('mesh', {
        auto: true,
        pins: [
            COMMANDS.get,
            COMMANDS.set
        ]
    })
    .ready(callback);
};

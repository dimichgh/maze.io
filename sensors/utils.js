'use strict';

const Seneca = require('seneca');
const AsyncValue = require('raptor-async/AsyncValue');

module.exports.register = function register(name, provider) {
    const readyState = new AsyncValue();
    const pins = [
        `role:stats,type:${name}`,
        `role:stats,type:${name},pid:${process.pid}`
    ];
    Seneca()
        .add(pins[0], provider)
        .add(pins[1], provider)
        .use('mesh', {
            auto: true,
            pins: pins
        })
        .ready(() => {
            readyState.resolve();
        });

    return readyState;
};

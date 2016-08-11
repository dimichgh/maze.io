'use strict';

const Utils = require('./utils');
const Loopbench = require('loopbench');
const sampler = Loopbench();

const getStats = () => {
    return {
        delay: sampler.delay,
        limit: sampler.limit,
        overLimit: sampler.overLimit
    };
};

module.exports = Utils.register('gc', function(msg, callback) {
    callback(null, getStats());
});

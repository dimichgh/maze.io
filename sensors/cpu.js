'use strict';

const Usage = require('usage');
const Utils = require('./utils');

module.exports = Utils.register('cpu', function(msg, callback) {
    Usage.lookup(process.pid, {
        keepHistory: true
    }, callback);
});

'use strict';

var Utils = require('./utils');

module.exports = Utils.register('http', function(msg, callback) {
    var stats = {
        '2XX': 3,
        '3XX': 1
    };
    callback(null, stats);
});

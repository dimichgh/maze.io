'use strict';

var Utils = require('./utils');

module.exports = Utils.register('memory', function(msg, callback) {
    var mem = process.memoryUsage();

    var stats = {
        rss: Math.round(mem.rss / 1024), //Kbytes
        heapUsed: Math.round(mem.heapUsed / 1024), //Kbytes
        heapTotal: Math.round(mem.heapTotal / 1024) //Kbytes
    };
    callback(null, stats);
});

'use strict';

const Utils = require('./utils');
const GcStats = (require('gc-stats'))();
const stringify = require('fast-safe-stringify');

const initState = () => {
    return {
        gcCount: 0,
        gcIncrementalCount: 0,
        gcInterval: 0,
        heapSizePostGC: 0
    };
};

const getStats = () => {
    var s = JSON.parse(stringify(stats));
    stats = initState();
    return s;
};

var stats = initState();

GcStats.on('stats', info => {
    if (info.gctype === 1) {
        stats.gcIncrementalCount++;
    } else {
        stats.gcCount++;
    }
    stats.heapSizePostGC = Math.round((info.after.usedHeapSize || 0) / 1024);
    // Accumulate msec spent doing GC work
    stats.gcInterval += info.pauseMS;
});

module.exports = Utils.register('gc', function(msg, callback) {
    callback(null, getStats());
});

module.exports.getStats = getStats;

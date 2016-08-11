'use strict';

const Async = require('async');

// get them self-register
const sensors = {
    cpuSensor: require('./cpu').done,
    gcSensor: require('./gc').done,
    memorySensor: require('./memory').done,
    httpSensor: require('./http').done,
    eventLoopSensor: require('./event-loop').done
};

module.exports.ready = (callback) => {
    Async.parallel(sensors, callback);
};

'use strict';

require('../sensors');

module.exports.start = function start(options) {
    require(options.name);
};

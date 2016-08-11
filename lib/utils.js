'use strict';

module.exports.tryResolve = function tryResolve(name) {
    try {
        return require.resolve(name);
    }
    catch (err) {
    }
};

'use strict';

var seneca;
require('seneca')().use('mesh', {
    auto: true
}).ready(function onReady() {
    seneca = this;
});

function get(filter, callback) {
    var args = [].slice.call(arguments);
    callback = args.pop();
    filter = args.pop();

    if (!seneca) {
        return callback(new Error('Not yet initialized'));
    }

    seneca.act('role:mesh,get:members', (err, all) => {
        if (filter && all) {
            all = all.reduce((memo, member) => {
                if (filter(member)) {
                    memo.push(member);
                }
                return memo;
            }, []);
        }
        callback(err, all);
    });
}

module.exports.all = get.bind(null, null);
module.exports.for = get;

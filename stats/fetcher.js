'use strict';

var Jsonic = require('jsonic');
var Async = require('async');
var Members = require('../members');
var Seneca = require('seneca');

var seneca;
Seneca().use('mesh', {
    auto: true
}).ready(function onReady() {
    seneca = this;
});

module.exports.get = function get(type, callback) {
    Members.all((err, all) => {
        let pins = all.reduce((memo, mbr) => {
            let pins = Array.isArray(mbr.pin) ? mbr.pin : [mbr.pin];
            pins.map(pin => {
                let pinMeta = Jsonic(pin);
                if (pinMeta.role === 'stats' &&
                    pinMeta.type === type &&
                    pinMeta.pid !== undefined) {

                    memo.push(pin);
                }
            });
            return memo;
        }, []);

        Async.map(pins, getFrom, callback);
    });
};

function getFrom(pin, callback) {

    if (!seneca) {
        return callback(new Error('Not yet initialized'));
    }

    seneca.act(pin, callback);
}

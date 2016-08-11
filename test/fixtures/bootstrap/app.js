'use strict';

var express = require('express');
var app = express();

app.get('/hello', function (req, res) {
    res.end(JSON.stringify({
        greetings: 'hello'
    }));
});

var svc = app.listen(0, function () {
    process.emit('online', {
        port: svc.address().port
    });
    if (process.send) {
        process.on('SIGTERM', function() {
        	process.send('done');
        	process.exit(1);
        });
        process.send('online');
    }
});

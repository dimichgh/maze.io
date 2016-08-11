'use strict';

var express = require('express');
var app = express();
app.get('/', function (req, res) {
    res.end('hello world');
}).listen(8080);

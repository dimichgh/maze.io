'use strict';

/*
 * The base provides a base to form a ring amoung all clients in the network
 * Currenlty all clients run on the same box
*/
require('seneca')()
    .use('mesh', {
        base: true,
        model: 'actor'
    });

'use strict';

var Bootstrap = require('./lib/bootstrap');

process.title = 'app-pilot';
// remove app-pilot command to let bootstrap process act as main entry
process.argv.splice(1, 1);

try {
    Bootstrap.start({
        name: require.resolve(process.argv[1])
    });
}
catch (err) {
    console.log('Cannot find child module "%s", usage:\n\tnode app-pilot <module path|name> [optional parameters]', process.argv[1], err);
}

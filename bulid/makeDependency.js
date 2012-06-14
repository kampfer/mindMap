var path = require('path');
var makeDeps = require('./dependency').makeDeps;

makeDeps( path.resolve( __dirname, '../client/js/') );
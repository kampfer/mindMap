var combine = require('./combine').combine;
var path = require('path');
var makeDeps = require('./dependency').makeDeps;

//makeDeps( path.resolve( __dirname, '../client/js/') );

combine( path.resolve( __dirname, '../client/js/mindmap.js') );
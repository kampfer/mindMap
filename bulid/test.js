var combine = require('./combine').combine;
var path = require('path');
var makeDeps = require('./dependency').makeDeps;
var compress = require('./compress').compressFile;

//makeDeps( path.resolve( __dirname, '../client/js/') );

combine( path.resolve( __dirname, '../client/js/mindmap.js') );

compress( path.resolve( __dirname, '../client/js/mindmap.js') );
var combine = require('./lib/combine'),
    dep = require('./lib/dependency'),
    fs = require('fs'),
    path = require('path'),
    config = require('./lib/config');

config.parse( path.join(__dirname, 'config.json') );
dep.init(config);
combine.init(dep, config);

var testUri = path.resolve(__dirname, '../', 'js/app/b.js');
console.log( combine.combineCode(testUri) );
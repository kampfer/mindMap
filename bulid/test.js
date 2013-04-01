var fs = require('fs'),
    path = require('path'),
    combine = require('./lib/combine'),
    dep = require('./lib/dependency');
    //compress = require('./compress').compressFile;

try{
    var config = JSON.parse( fs.readFileSync('config.json') );
} catch(e) {
    console.log(e);
}

var root = path.resolve(__dirname, '..'), 
    uri;

function getPath(uri) {
    return path.join(root, uri);
}

if(config) {
    if(config.source) {
        dep.init( getPath(config.source), config.nameSpace );
    }

    if(config.distribute) {
        combine.init(dep);
        combine.merge( getPath(config.distribute) );
    }
}
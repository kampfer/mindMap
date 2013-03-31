var dep = require('./dependency'),
    path = require('path'),
    config = require('./config'),
    fs = require('fs');

dep.makeDeps( path.resolve( __dirname, '../client/js/') );

exports.combine = function(uri) {
    var stat = fs.statSync(uri);

    if( stat.isDirectory() ) {
        fs.readDirSync(uri)
            .foreach(function(file) {
                exports.combine( path.join(uri + file) );
            });
    } else if( stat.isFile() ) {
        var deps = dep.getFileDependency(uri),
            content = [];

        //TODO  生成一个依赖树

        for(var i = deps.length - 1; i >= 0; i--) {
            var depPath = path.join(config.jsDir, deps[i]),
                temp = fs.readFileSync(depPath);
            content.unshift(temp);
        }

        fs.writeFileSync( uri, content.join('\n') );
    }
};
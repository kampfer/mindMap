var path = require('path'),
    fs = require('fs');

var dependency;

exports.merge = function(uri) {
    var stat = fs.statSync(uri);

    if( stat.isDirectory() ) {
        fs.readDirSync(uri)
            .foreach(function(file) {
                exports.combine( path.join(uri + file) );
            });
    } else if( stat.isFile() ) {
        var deps = dependency.getImportScripts(uri),
            content = [];

        //TODO  生成一个依赖树

        for(var i = deps.length - 1; i >= 0; i--) {
            var depPath = path.join(config.root, deps[i]),
                temp = fs.readFileSync(depPath);
            content.unshift(temp);
        }

        fs.writeFileSync( uri, content.join('\n') );
    }
};

exports.init = function(dep) {
    dependency = dep;
};
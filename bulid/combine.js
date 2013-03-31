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
            file = fs.openSync(uri, 'w+'),
            content = fs.readFileSync(uri);

        fs.writeFileSync(file, '');

        console.log(deps);

        deps.forEach(function(depPath) {
            depPath = path.join(config.jsDir, depPath);
            var temp = fs.readFileSync(depPath);
            fs.appendFileSync(uri, temp);
        });

        fs.appendFileSync(uri, content);
    }
};
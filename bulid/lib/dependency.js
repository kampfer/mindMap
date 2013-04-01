var fs = require('fs');
var path = require('path');

/**
 * 保存依赖性信息的对象。dependency组件不仅将依赖性信息保存在deps.js文件中，而且
 * 会在内存中保存一份依赖性记录（以object的形式）。
 * @type    {object}
 * @private
 */
var dependencies = {
    pathToNames: {},    // 1 to many
    nameToPath: {},     // 1 to 1
    requires: {}        // 1 to many
};

var config = {
    depsFileName : 'deps.js',
    nameSpace : 'kampfer',
    root : null,
    depsPath : null
};

/**
 * 解析指定uri文件的依赖性信息
 * @param   {string}uri     指定文件的uri
 * @return  {object}    文件的依赖性信息，包括文件路径地址，声明的所有的命名空间
 * 以及依赖的所有模块
 */
function getInfo(uri) {
    var reg = config.nameSpace + '\\.(require|provide)\\([\'\"](.+)[\'\"]\\)',
        provides = [],
        requires = [],
        content = fs.readFileSync(uri),
        match;

    reg = new RegExp(reg, 'g');

    do {
        match = reg.exec(content);

        if(match) {
            if( match[1] === 'require' ) {
                requires.push('\'' + match[2] + '\'');
            }
            if( match[1] === 'provide' ) {
                provides.push('\'' + match[2] + '\'');
            }
        }
    } while(match);

    return {
        path : path.relative(config.root, uri),
        provides : provides,
        requires : requires
    };
}


/**
 * 使用给定的依赖性关系（path、provides、requires）在依赖性记录中添加一条记录
 * @param   {string}    文件的绝对路径
 * @param   {array}     文件中定义的命名空间
 * @param   {array}     文件依赖的模块
 * @param   {boolean}   true：记录添加成功，否则失败
 */
function addDepsToFile(path, provides, requires) {
    var insertText, fd;

    path = path.replace(/\\/g, '/');
    requires = '[' + requires.join(',') + ']';
    provides = '[' + provides.join(',') + ']';

    insertText = [
        config.nameSpace,
        '\.addDependency(\'',
        path,
        '\', ',
        provides,
        ', ',
        requires,
        ');\n'
    ].join('');

    try{
        fd = fs.openSync(config.depsPath, 'a');
        fs.writeSync(fd, insertText, 0, 'utf8');
    }catch(e){
        return false;
    }

    return true;

}


/**
 * 将依赖性记录保存在内存中（以exports.dependencies的形式）。
 * @param   {string}    文件的绝对路径
 * @param   {array}     文件中定义的命名空间
 * @param   {array}     文件依赖的模块
 */
function addDepsToObj(path, provides, requires) {
    var provide, require, deps;
        path = path.replace(/\\/g, '/');
        deps = dependencies;

    for( var i = 0; (provide = provides[i]); i++) {
        deps.nameToPath[provide] = path;
        if (!(path in deps.pathToNames)) {
            deps.pathToNames[path] = {};
        }
        deps.pathToNames[path][provide] = true;
    }

    for( var j = 0; (require = requires[j]); j++) {
        if (!(path in deps.requires)) {
            deps.requires[path] = {};
        }
        deps.requires[path][require] = true;
    }
}


exports.addDep = function(uri) {
    var stat = fs.lstatSync(uri);

    if( stat.isDirectory() ) {
        fs.readdirSync(uri).forEach(function(part) {
            exports.addDep( path.join(uri, part) );
        });
    }

    if( stat.isFile() && path.basename(uri) !== config.depsFileName ) {
        if( /^test\_?/.test( path.basename(uri) ) ||
            path.extname(uri) !== '.js' ) {
            return;
        }

        var record = getInfo(uri);

        addDepsToFile(record.path, record.provides, record.requires);
        addDepsToObj(record.path, record.provides, record.requires);

        console.log('added dependency record: ' + record.path);
    }
}


/**
 * 生成一个依赖性记录文件，这个文件包含uri下所有文件的依赖性关系。文件名由deps指定。
 * @param   {string}uri     文件或目录的路径地址
 * @param   {string}deps    生成的记录文件的名字
 */
exports.init = function(root, ns) {
    if(!root) {
        return;
    }

    if( fs.statSync(root).isFile() ) {
        root = path.dirname(uri);
    }
    config.root = root;

    if(ns) {
        config.nameSpace = ns;
    }

    config.depsPath = path.join(root, config.depsFileName);

    fs.writeFileSync(config.depsPath, '');
    console.log('created new deps.js : ' + config.depsPath);

    exports.addDep(root);
};


exports.getDeps = function() {
    return dependencies;
};


exports.getImportScripts = function(uri) {
    var nameToPath = dependencies.nameToPath,
        deps = [],
        visited = {},
        added = {};
    
    function visit(uri) {
        if(added[uri]) {
            return;
        }

        if(visited[uri]) {
            //throw uri + ' circle refer';
            if(!added[uri]) {
                deps.push(uri);
                added[uri] = true;
                return;
            }
        }
        visited[uri] = true;

        var requires = dependencies.requires[uri];
        
        if(requires) {
            for(var file in requires) {
                file = nameToPath[file];
                if(!added[file]) {
                    visit(file);
                }
            }
        }
        
        if(!added[uri]) {
            deps.push(uri);
            added[uri] = true;
        }
    }
    
    uri = path.relative(config.root, uri);
    if(dependencies.requires[uri]) {
        visit(uri);
    }

    return deps;
};
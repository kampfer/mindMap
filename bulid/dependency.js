/*global console process*/

var fs = require('fs'),
	path = require('path');
	
/**
 * 保存依赖性信息的对象。dependency组件不仅将依赖性信息保存在deps.js文件中，而且
 * 会在内存中保存一份依赖性记录（以object的形式）。
 * @type	{object}
 * @private
 */
var dependencies = {
	pathToNames: {},	// 1 to many
	nameToPath: {},		// 1 to 1
	requires: {}		// 1 to many
};


var platform = process.platform;

function isOnWindow() {
	return (/win/g).test(platform);
}


/**
 * 解析指定uri文件的依赖性信息
 * @param	{string}uri		指定文件的uri
 * @return	{object}	文件的依赖性信息，包括文件路径地址，声明的所有的命名空间
 * 以及依赖的所有模块
 */	
function getInfo(uri) {
	var reg = /kampfer\.(require|provide)\([\'\"](.+)[\'\"]\)/g,
		provides = [],
		requires = [],
		content = fs.readFileSync(uri),
		match;
		
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
		path : path.relative(exports.dir, uri),
		provides : provides,
		requires : requires
	};
}


/**
 * 使用给定的依赖性关系（path、provides、requires）在依赖性记录中添加一条记录
 * @param	{string}	文件的绝对路径
 * @param	{array}		文件中定义的命名空间
 * @param	{array}		文件依赖的模块
 * @param	{boolean}	true：记录添加成功，否则失败
 */
function addDepsToFile(path, provides, requires) {
	
	var insertText, fd;
	
	path = path.replace(/\\/g, '/');
	requires = '[' + requires.join(',') + ']';
	provides = '[' + provides.join(',') + ']';
	
	insertText = [
		'kampfer.addDependency(\'',
		path,
		'\', ',
		provides,
		', ',
		requires,
		');\n'
	].join('');
	
	try{
		fd = fs.openSync(exports.path, 'a');
		fs.writeSync(fd, insertText, 0, 'utf8');
	}catch(e){
		return false;
	}
	
	return true;
	
}


/**
 * 将依赖性记录保存在内存中（以exports.dependencies的形式）。
 * @param	{string}	文件的绝对路径
 * @param	{array}		文件中定义的命名空间
 * @param	{array}		文件依赖的模块
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

	
/**
 * 解析指定uri文件的依赖关系，并在deps文件中生成一条记录
 * @param {string}uri	文件路径地址
 */
function addRecord(uri) {
	
	//测试用文件（test_开头）、非js文件不处理
	if( /^test\_?/.test( path.basename(uri) ) ||
		path.extname(uri) !== '.js' ) {
		return;
	}
	
	var record = getInfo(uri);
	
	addDepsToFile(record.path, record.provides, record.requires);
	addDepsToObj(record.path, record.provides, record.requires);
	
	console.log('added dependency record: ' + record.path);
	
}


/**
 * 解析指定的uri，区分开目录地址和文件地址。如果是目录则递归的遍历目录内所有子文件，
 * 如果是文件那么调用addRecord函数生成文件的依赖关系记录。
 * @param {string}uri	文件路径地址
 */
function visit(uri) {
	var stat = fs.lstatSync(uri);
	
	if( stat.isDirectory() ) {
		fs.readdirSync(uri).forEach(function(part) {
			visit( path.join(uri, part) );
		});
	}
	
	if( stat.isFile() && path.basename(uri) !== path.basename(exports.path) ) {
		addRecord(uri);
	}
}


/**
 * 记录依赖性的文件所在的目录名。
 * @type	{string}
 */
exports.dir = '';


/**
 * 记录依赖性的文件的地址（绝对路径保存），文件名为‘deps.js’。
 * @type	{string}
 */
exports.path = '';


/**
 * 生成一个依赖性记录文件，这个文件包含uri下所有文件的依赖性关系。文件名由deps指定。
 * @param	{string}uri		文件或目录的路径地址
 * @param	{string}deps	生成的记录文件的名字
 */
exports.makeDeps = function(uri, deps) {
	
	if(!uri) {
		return;
	}
	
	exports.dir = uri;
	exports.path = path.join(exports.dir, 'deps.js');
	
	if(!deps) {
		deps = exports.path;
	}else{
		exports.path = deps;
	}
	
	console.log('make dependency file: ' + deps);
	//创建deps.js文件，若已经存在，删除旧的然后重新创建新文件
	var fd = fs.openSync(deps, 'w');
	fs.writeSync(fd, '', 0, 'utf8');
	
	visit(uri);
	
	return dependencies;
	
};


/**
 * 解析出指定文件所依赖的模块
 * @param	{string}file	文件的路径地址
 * @return	{array}			文件依赖的所有模块
 */
exports.getRequires = function(file) {
	
	var record = getInfo(file);
		
	return record.requires;
};


/**
 * 解析出指定文件中声明的全部命名空间
 * @param	{string}file	文件的路径地址
 * @return	{array}			文件中声明的命名空间
 */
exports.getProvides = function(file) {
	
	var record = getInfo(file);
		
	return record.provides;
	
};


//暴露出add方法
exports.add = function() {
	
	if(arguments.length === 1) {
		addRecord(arguments[0]);
	} else if(arguments.length === 3) {
		addDepsToFile.apply(exports, arguments);
		addDepsToObj.apply(exports, arguments);
	}
	
};

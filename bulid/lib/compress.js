var UglifyJS = require("uglify-js"),
    path = require('path'),
    fs = require('fs');

exports.compressCode = function(code) {
    var ast = UglifyJS.parse(code);
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor();
    ast = ast.transform(compressor);
    code = ast.print_to_string(); // get compressed code
    return code;
};

exports.compressFile = function(uri) {
    var code = fs.readFileSync(uri).toString();
    console.log(code);
    var compressedCode = exports.compressCode(code);
    fs.writeFileSync(uri, compressedCode);
};
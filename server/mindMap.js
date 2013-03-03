var connect = require('connect');

connect.static.mime.define({
    'text/cache-manifest' : ['mf', 'manifest']
});

var app = connect()
    .use( connect.logger('dev') )
    .use( connect.static(__dirname + '/mindmap/client/') )
    .listen(8000);
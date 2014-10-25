var static = require('node-static');
var http = require('http');

var fileServer = new static.Server("./snap");

http.createServer(function (req, res) {
	var reqPath = require('url').parse(req.url);
	if(reqPath.pathname == '/') {
		console.log('Serving default Snap! page');
		fileServer.serveFile('/snap.html', 200, {}, req, res);
	}
	else if (reqPath.pathname.indexOf('/ev3dev') == 0) {
		console.log('Request for ev3 function');
		//TODO: implement
	}
	else {
		console.log('Serving "' + reqPath.pathname  + '"');
		fileServer.serve(req, res);
	}
}).listen(80);

console.log('Server listening on port 80');

var static = require('node-static');
var http = require('http');
var ev3 = require('./ev3dev.js');

var fileServer = new static.Server("./snap");

//create a server
http.createServer(function (req, res) {
	var reqPath = require('url').parse(req.url, true);

	//if there's no specific path request, just serve the default
	if(reqPath.pathname == '/') {
		console.log('Serving default Snap! page');
		fileServer.serveFile('/snap.html', 200, {}, req, res);
	}
	//if the request is looking for an ev3dev function, process it
	else if (reqPath.pathname.indexOf('/ev3dev') == 0) {
		var pathParts = reqPath.pathname.split('/');
		console.log('Request for ev3 function: ' + pathParts);
		
		//if the request is for sensor values, read a value and return it
		if(pathParts[pathParts.length - 1] == "sensor") {
			var portName = reqPath.query['portName'];
			var valueIndex = parseInt(reqPath.query['index']);
			console.log('Request for sensor "' + portName +  '" and value index "' + valueIndex +  '"');
			var sensor = new ev3.Sensor(portName);var value = sensor.getFloatValue(valueIndex);
			console.log(value);
			res.end(value.toString());
		}
	}
	//otherwise, assume it's looking for Snap! files
	else {
		console.log('Serving "' + reqPath.pathname  + '"');
		fileServer.serve(req, res);
	}
}).listen(80);

console.log('Server listening on port 80');

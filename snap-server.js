var static = require('node-static');
var http = require('http');
var ev3 = require('./ev3dev.js');

var fileServer = new static.Server("./snap");

var sensors = {};

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
        pathParts.shift();

        console.log('Request for ev3 function: ' + pathParts);
        
        var endPath = pathParts[pathParts.length - 1];
        var value = evaluateFunctionEndpoint(endPath, reqPath.query);

        res.end(value.toString());
    }
    //otherwise, assume it's looking for Snap! files
    else {
        console.log('Serving "' + reqPath.pathname  + '"');
        fileServer.serve(req, res);
    }
}).listen(80);

console.log('Server listening on port 80');

function evaluateFunctionEndpoint(endpointName, query) {
    switch (endpointName) {
        case 'sensor':
            var portName = query['portName'], valueIndex = query['index'];
            if (sensors[portName] == undefined)
                sensors[portName] = new ev3.Sensor(portName);
            return sensors[portName].getFloatValue(valueIndex);
        case 'motor':
            break;
    }
}
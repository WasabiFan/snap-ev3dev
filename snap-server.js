var static = require('node-static');
var http = require('http');
var ev3 = require('./ev3dev.js');

var fileServer = new static.Server("./snap", { cache: 0 });

var sensors = {}, motors = {};

//Create a server
http.createServer(function (req, res) {
    var reqPath = require('url').parse(req.url, true);

    //If there's no specific path request, just serve the default
    if(reqPath.pathname == '/') {
        console.log('Serving default Snap! page');
        fileServer.serveFile('/snap.html', 200, {}, req, res);
    }
    //If the request is looking for an ev3dev function, process it
    else if (reqPath.pathname.indexOf('/ev3dev') == 0) {
        var pathParts = reqPath.pathname.split('/');
        pathParts.shift();

        console.log('Request for ev3 function: ' + pathParts);
        
        var endPath = pathParts[pathParts.length - 1];
        var value = evaluateFunctionEndpoint(endPath, reqPath.query);

        res.writeHead(200, {
            'Cache-Control': 'no-cache'
        });
        res.end(value.toString());
    }
    //Otherwise, assume it's looking for Snap! files
    else {
        console.log('Serving "' + reqPath.pathname  + '"');
        fileServer.serve(req, res);
    }
}).listen(80);

console.log('Server listening on port 80');

function evaluateFunctionEndpoint(endpointName, query) {
    var portName = query['portName'],
        valueIndex = query['index'],
        propertyName = query['property'],
        propertyValue = query['value'];

    //Process the request's endpoint name
    switch (endpointName) {
        case 'sensor':
            //If we haven't already initialized a sensor for this port, do it now
            if (sensors[portName] == undefined)
                sensors[portName] = new ev3.Sensor(portName);

            //If they are requesting a sensor value,
            //    use the helper function to adjust the value according to dp
            if (valueIndex != undefined)
                return sensors[portName].getFloatValue(valueIndex);

            //If they have not specified a new value, they are trying to read
            if (propertyValue == undefined)
                return sensors[portName].getString(propertyName);

            //If we are still executing and haven't returned yet,
            //    we assume that they are trying to set a value
            sensors[portName].setString(propertyName, propertyValue);

            //Return something
            //   TODO: return a status code instead of a blank string
            return '';

        case 'motor':
            //If we haven't already initialized a motor for this port, do it now
            if (motors[portName] == undefined)
                motors[portName] = new ev3.Motor(portName);

            //If they have not specified a new value, they are trying to read
            if(propertyValue == undefined)
                return motors[portName].getString(propertyName);

            //If we are still executing and haven't returned yet,
            //    we assume that they are trying to set a value
            motors[portName].setString(propertyName, propertyValue);

            //Return something
            //   TODO: return a status code instead of a blank string
            return '';
    }
}

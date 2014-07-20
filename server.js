/* DATASTORE */
var accel = [];
var ambient = [];
var climate = [];

/* HANDLERS */
var handlers = {
    writeAccel: function (req, res, data) { 
        console.log('writeAccel!', data);
        accel.push(JSON.parse(data));

        res.end(JSON.stringify(accel));
    },
    writeAmbient: function (req, res, data) { 
        console.log('writeAmbient!', data);
        ambient.push(JSON.parse(data));

        res.end(JSON.stringify(ambient));
    },
    writeClimate: function (req, res, data) { 
        console.log('writeClimate!', data);
        climate.push(JSON.parse(data));
        res.end(JSON.stringify(climate));
    },
    readAccel: function (req, res) { 
        console.log('readAccel');
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(accel));
    },
    readAmbient: function (req, res) { 
        console.log('readAmbient!');

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(ambient));
    },
    readClimate: function (req, res) { 
        console.log('readClimate!');
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(climate));
    }
};

/* HTTP SERVER */
var http  = require("http");
var url = require('url');

var server = http.createServer(function (req, res) {
    // set up routing
    var url_parts = url.parse(req.url, true);
    var command = url_parts.query.message;
    if (handlers[command]) { 
        handlers[command](req, res, url_parts.query.data); 
    } else {
        res.write('Use the API!');
        res.end();
    }
});
server.listen(8000);

/* DATASTORE */
var accel = [];
var ambient = [];
var climate = [];

/* HANDLERS */
var handlers = {
    writeAccel: function (req, res, data) { 
        console.log('writeAccel!', data);
        accel.push(JSON.parse(data));

        res.writeHead(200);
        res.write(JSON.stringify(accel));
        res.end();
    },
    writeAmbient: function (req, res, data) { 
        console.log('writeAmbient!', data);
        ambient.push(JSON.parse(data));

        res.writeHead(200);
        res.write(JSON.stringify(ambient));
        res.end();
    },
    writeClimate: function (req, res, data) { 
        console.log('writeClimate!', data);
        climate.push(JSON.parse(data));

        res.writeHead(200);
        res.write(JSON.stringify(climate));
        res.end();
    },
    readAccel: function (req, res) { 
        console.log('readAccel');
        res.writeHead(200);
        res.write(JSON.stringfiy(accel));
        res.end();
    },
    readAmbient: function (req, res) { 
        console.log('readAmbient!');
        res.writeHead(200);
        res.write(JSON.stringify(ambient));
        res.end();
    },
    readClimate: function (req, res) { 
        console.log('readClimate!');
        res.writeHead(200);
        res.write(JSON.stringify(climate));
        res.end();
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
        res.end();
    }
});
server.listen(8000);

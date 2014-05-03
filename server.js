#!/bin/env node
//Required files
var express    = require('express');
var connect    = require('connect');
var sharejs    = require('share');
var path       = require('path');

var fs      = require('fs');
var dbManager = require('./config/database');
var document  = require('./routes/document');

//IP and port variables
var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port 	  = process.env.OPENSHIFT_NODEJS_PORT || 8000;
if (typeof ipAddress === "undefined") {
    console.warn('Running on localhost');
    ipAddress = "127.0.0.1";
};

//Application and DB init
var app = express();
var database  = dbManager.connect();
var DocumentModel = require('./models/documentModel').createModel(database);

//Application uses
app.use(require('body-parser')());
app.use(require('method-override')())
//Routes definition
/*app.get('/document', document.getDocuments(db));
app.post('/document', document.createDocument(db));
app.delete('/document', document.deleteDocuments(db));
app.get('/document/:id', document.showDocument(db));
app.put('/document/:id', document.modifyDocument(db));
app.delete('/document/:id', document.deleteDocument(db));
app.get('*', function(req, res){ res.send(404); });*/



/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/
//app.set('views', path.join(__dirname, 'public'));
//app.engine('.html', require('jade').__express);
app.use(express.static(__dirname + '/public'));

/*var routes = require('./routes/index');
app.use('/document', routes);*/


setupTerminationHandlers();

var options = {
	db: {
		type: 'mongo',
		uri: dbManager.getDatabaseURL()
	},
	port: port
};
sharejs.server.attach(app, options);

//Server starting
var server = app.listen(port, ipAddress, function() {
    console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), ipAddress, port);
});

//Do on exit
function onExit(sig){
	dbManager.close(); //Close database connection
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating server ...', Date(Date.now()), sig);
       process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()) );
};


//Setup termination handlers (for exit and a list of signals).
function setupTerminationHandlers(){
    process.on('exit', function() { onExit(); });

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { onExit(element); });
    });
};

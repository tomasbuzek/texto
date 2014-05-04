#!/bin/env node
//Required files
var express    = require('express');
var connect    = require('connect');
var sharejs    = require('share');
var path       = require('path');
var bodyParser = require('body-parser');

var fs      = require('fs');
var connectionManager = require('./config/connectionManager');
var document  = require('./routes/document');

//Application and DB init
var app = express();
var database  = connectionManager.connectDB();

var DocumentModel = require('./models/documentModel').createModel(database);

//Application uses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(require('method-override')())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    req.database = database;
    req.app = app;
    req.connectionManager = connectionManager;
    next();
});

//Routes definition
app.use('/', document);

var options = {
	db: {
		type: 'redis',
		hostname: connectionManager.getRedisIP(),
		port: connectionManager.getRedisPort(),
		auth: connectionManager.getRedisAuth()
	},
	browserChannel: {
		cors:"*"
	}
};
sharejs.server.attach(app, options);

setupTerminationHandlers();

//Server starting
var server = app.listen(connectionManager.getHostPort(), connectionManager.getHostIP(), function() {
    console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), connectionManager.getHostIP(), connectionManager.getHostPort());
});

//Do on exit
function onExit(sig){
	connectionManager.closeDB(); //Close database connection
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

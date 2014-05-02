#!/bin/env node
//Required files
var express = require('express');
var connect = require('connect');
var sharejs = require('share');

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
var db  = dbManager.connect();
var DocumentModel = require('./models/documentModel').createModel(db);

//Application uses
app.configure(function() {
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

//Routes definition
/*app.get('/document', document.getDocuments(db));
app.post('/document', document.createDocument(db));
app.delete('/document', document.deleteDocuments(db));
app.get('/document/:id', document.showDocument(db));
app.put('/document/:id', document.modifyDocument(db));
app.delete('/document/:id', document.deleteDocument(db));

app.get('*', function(req, res){ res.send(404); });*/

setupTerminationHandlers();

var options = {db: {type: 'mongo'}};
sharejs.server.attach(app, options);

//Server starting
app.listen(port, ipAddress, function() {
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
#!/bin/env node
//Required files
var express = require('express');
var fs      = require('fs');
var dbManager = require('./database');
var document  = require('./routes/document');

//IP and port variables
var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port 	  = process.env.OPENSHIFT_NODEJS_PORT || 8080;
if (typeof ipAddress === "undefined") {
    console.warn('Running on localhost');
    ipAddress = "127.0.0.1";
};

//Application and DB init
var app = express();
var db  = dbManager.connect();

//Application uses
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

//Routes definition
app.get('/documents', document.getDocuments(db));
app.post('/createdocument', document.createDocument(db));
app.get('/document/:id', document.showDocument(db));
app.put('/document/:id', document.modifyDocument(db));

//Todo on exit
var onExit = function(sig){
	db.close(); //Close database connection
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating server ...', Date(Date.now()), sig);
       process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()) );
};


//Setup termination handlers (for exit and a list of signals).
var setupTerminationHandlers = function(){
    process.on('exit', function() { onExit(); });

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { onExit(element); });
    });
};

setupTerminationHandlers();

//Server starting
app.listen(port, ipAddress, function() {
    console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), ipAddress, port);
});
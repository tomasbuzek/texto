#!/bin/env node
// setup ======================================================================
var express		= require('express');
var app 		= express();
var connect		= require('connect');
var sharejs		= require('share');
var passport	= require('passport');
var path		= require('path');
var bodyParser	= require('body-parser');
var flash		= require('connect-flash');

var connectionManager = require('./config/connectionManager');
var document  = require('./routes/document');
var server = require('http').createServer(app);

// configuration ======================================================================
require('./config/passport')(passport);
var document = require('./routes/document');
var io = require('./config/io')(server, app, connectionManager, document);

app.use(require('morgan')({ format: 'dev', immediate: true }));
app.use(require('cookie-parser')());
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(require('express-session')({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req,res,next){
    req.database = database;
    req.app = app;
    req.io = io;
    req.connectionManager = connectionManager;
    next();
});

// routes ======================================================================
require('./routes/index')(app);
require('./routes/passport')(app, passport);
app.use('/', document.router);

// models ======================================================================
var database  = connectionManager.connectDB();
var DocumentModel = require('./models/documentModel').createModel(database);

// launch ======================================================================
setupTerminationHandlers();
server.listen(connectionManager.getHostPort(), connectionManager.getHostIP(), function() {
    console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), connectionManager.getHostIP(), connectionManager.getHostPort());
});
var options = connectionManager.getShareOptions();
sharejs.server.attach(app, options);

// termination ======================================================================
function onExit(sig){
	connectionManager.closeDB();
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating server ...', Date(Date.now()), sig);
       process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()) );
};

function setupTerminationHandlers(){
    process.on('exit', function() { onExit(); });

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { onExit(element); });
    });
};

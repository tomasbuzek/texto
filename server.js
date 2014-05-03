#!/bin/env node

// setup ======================================================================
var express		= require('express');
var app 		= express();
var connect		= require('connect');
var sharejs		= require('share');
var passport	= require('passport');
var flash		= require('connect-flash');

var connectionManager = require('./config/connectionManager');

// configuration ======================================================================
require('./config/passport')(passport);

app.use(require('morgan')({ format: 'dev', immediate: true }));
app.use(require('cookie-parser')());
app.use(require('body-parser')());
app.use(require('method-override')())
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(require('express-session')({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes ======================================================================
require('./routes/index')(app);
require('./routes/passport')(app, passport);
var document  = require('./routes/document');

// models ======================================================================
var database  = connectionManager.connectDB();
/*var documentModel = require('./models/documentModel').createModel(database);*/

// launch ======================================================================
setupTerminationHandlers();
var server = app.listen(connectionManager.getHostPort(), connectionManager.getHostIP(), function() {
    console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), connectionManager.getHostIP(), connectionManager.getHostPort());
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

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { onExit(element); });
    });
};

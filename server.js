#!/bin/env node
//Required files
var express    = require('express');
var sharejs    = require('share');
var path       = require('path');

var fs      = require('fs');
var connectionManager = require('./config/connectionManager');
var document  = require('./routes/document');

//Application and DB init
var app = express();
var database  = connectionManager.connectDB();
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
		uri: connectionManager.getDatabaseURL()
	},
	browserChannel: {
		cors:"*"
	}
};
sharejs.server.attach(app, options);

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

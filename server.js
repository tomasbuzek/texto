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
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var database  = connectionManager.connectDB();

var openedSockets = {};
var openedClients = {};
var openedDocuments = {};
io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('documentID', function (data) {
		if (openedDocuments[data.docID] == null) {
			openedDocuments[data.docID] = { clients: [] };
		}
		openedDocuments[data.docID].clients.push(socket.id);
		openedClients[socket.id] = data.docID;
		openedSockets[socket.id] = socket;
		console.log("Client:" + socket.id + " opened Document:" + openedClients[socket.id]);
	});
	socket.on('createPDF', function(data) {
		if (data) {
			if (data.docID) {
				document.convertToPDF(data.docID, app, connectionManager, function (error, id) {
					if (openedDocuments[id] != null) {
						if (openedDocuments[id].clients != null) {
							openedDocuments[id].clients.forEach(function(entry) {
								openedSockets[entry].emit('pdfCreated', { url: 'http://' });
							});
						}
					}
				});
			}
		}
	});
	socket.on('disconnect', function() {
		var document = openedClients[socket.id];
		var clients = openedDocuments[document].clients;
		openedDocuments[document].clients.splice(clients.indexOf(socket.id), 1);
		openedClients[socket.id] = null;
		openedSockets[socket.id] = null;
		console.log("Client:" + socket.id + " closed Document:" + document);
    });
});

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
    req.io = io;
    req.connectionManager = connectionManager;
    next();
});

//Routes definition
app.use('/', document.router);

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
server.listen(connectionManager.getHostPort(), connectionManager.getHostIP(), function() {
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

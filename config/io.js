var openedSockets = {};
var openedClients = {};
var openedDocuments = {};

function updateViewersNumber(id) {
	if (openedDocuments[id] != null) {
		if (openedDocuments[id].clients != null) {
			var numViewers = openedDocuments[id].clients.length;
			openedDocuments[id].clients.forEach(function(entry) {
				if (openedSockets[entry]) {
					openedSockets[entry].emit('numberOfViewersChange', { viewers: numViewers });
				}
			});
		}
	}
}

module.exports = function(server, app, connectionManager, document) {
	var io = require('socket.io').listen(server);
	
	io.sockets.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('documentID', function (data) {
			if (openedDocuments[data.docID] == null) {
				openedDocuments[data.docID] = { clients: [] };
			}
			openedDocuments[data.docID].clients.push(socket.id);
			openedClients[socket.id] = data.docID;
			openedSockets[socket.id] = socket;
			updateViewersNumber(data.docID);
			console.log("Client:" + socket.id + " opened Document:" + openedClients[socket.id]);
		});
		socket.on('createPDF', function(data) {
			if (data) {
				if (data.docID) {
					document.convertToPDF(data.docID, app, connectionManager, function (log, id, error) {
						if (openedDocuments[id] != null) {
							if (openedDocuments[id].clients != null) {
								openedDocuments[id].clients.forEach(function(entry) {
									openedSockets[entry].emit('pdfCreated', { log: log, error: error });
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
			openedDocuments[document].clients
			updateViewersNumber(document);
			console.log("Client:" + socket.id + " closed Document:" + document);
	    });
	});
	return io;
}
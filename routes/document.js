var express = require('express');
var router = express.Router();

var exec = require('child_process').exec;
var path = require('path');
var url = require('url');
var fs = require('fs');

var Hashids = require('hashids'),
hashids = new Hashids("ilovescotchscotchyscotchscotch", 8);

function getDocumentFolderPath(dataPath, id) {
	return path.join(dataPath, id);
}

function createTemplateContent(next) {
	var texTemplateFile = "public/template.tex";
	fs.readFile(texTemplateFile, function(error, data) {
	    if(error) {
	    	next(error, "");
	    } else {
	    	next(null, data);
	    }
	});
}

function documentToTempFile(id, app, dataPath, next) {
	app.model.getSnapshot(id, function(error, doc) {
		if (error) {
			next(error, null);
		} else {
			var filename = id + ".tex";
			var filepath = path.join(dataPath, filename);
			fs.writeFile(filepath, doc.snapshot, function(err) {
			    if(err) {
			    	next(error, null);
			    } else {
			    	next(null, filename);
			    }
			});
		}
	});
}

function createPDF(sourcefile, app, dataPath, latexpath, next) {
	var command = latexpath + "pdflatex -interaction=nonstopmode " + sourcefile;
	console.log(command);
	
	exec(command, {cwd: dataPath}, function (error, stdout, stderr) {
		var pdffilename = sourcefile.substring(0, sourcefile.length-3);
		if (error) {
			next(error, pdffilename);
		} else {
			next(null, pdffilename);
		}
	});
}

function sendPDF(res, filePath) {
	if (fs.existsSync(filePath)) {
		var stat = fs.statSync(filePath);

	    res.writeHead(200, {
	        'Content-Type': 'application/pdf',
	        'Content-Length': stat.size
	    });
	
	    var readStream = fs.createReadStream(filePath);
	    readStream.pipe(res);
	} else {
		res.send(404);
	}
}

function hasUserAccess(req, res, next) {
	var docID = req.params.id;
	var user  = req.user;
	var documentModel = req.documentModel;
	documentModel.findOne({ _id: docID }, function(err, doc) {
		if (err || !doc) {
			res.send(401, 'Access denied');
		} else {
			if (doc.isPublic) {
				next(req, res);
			} else {
				if (user) {
					var found = false;
					doc.users.forEach(function(entry) {
						if (entry === user.email) { found = true; return; }
					});
					if (found) { next(req, res); }
					else { res.send(401, 'Access denied'); }
				} else {
					res.send(401, 'Access denied');
				}
			}
		}
	});
}

function generateUniqueDocID(req, res, next) {
	var generated = false;
	var documentModel = req.documentModel;
	var id = hashids.encrypt(Math.floor((Math.random()*1000000000) + 1));
	
	console.log("Generated ID: " + id);
	
	documentModel.findOne({_id: id}, function(error, doc) {
		if (doc) {
			generateUniqueDocID(req, res, function(id) {
				next(id);
			});
		} else {
			next(id);
		}
	});
}

exports.convertToPDF = function(id, app, connectionManager, next) {
	var latexpath = connectionManager.getLaTeXPath();
	var dataPath = getDocumentFolderPath(connectionManager.getDocsPath(), id);
	if (!fs.existsSync(dataPath)){ fs.mkdirSync(dataPath); }
	if (id) {
		documentToTempFile(id, app, dataPath, function(error, sourcepath) {
			if (error) {
				next("Document (ID:" + id + ") PDF creation failed.", null);
			} else {
				createPDF(sourcepath, app, dataPath, latexpath, function(errorTeX, pdffilename){
					var logfilename = path.join(dataPath, pdffilename) + "log";
					fs.readFile(logfilename, 'utf8', function(error, data) {
						if (error) {
							next(error, id, errorTeX);
						} else {
							next(data, id, errorTeX);
						}
					});
				});
			}
		});
	} else {
		next("Error", null);
	}
}

exports.deleteDocumentFiles = function(docsPath, id) {
	var dataPath = getDocumentFolderPath(docsPath, id);
	if(fs.existsSync(dataPath)) {
		fs.readdirSync(dataPath).forEach(function(file, index){
			console.log(path.join(dataPath, file));
			fs.unlinkSync(path.join(dataPath, file));
		});
		fs.rmdirSync(dataPath);
	}
}

router.get('/document/:id/pdf', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		var connectionManager = req.connectionManager;
		var dataPath = getDocumentFolderPath(connectionManager.getDocsPath(), id);
		var pdffilename = id + ".pdf";
		
		var filePath = path.join(dataPath, pdffilename);
		
		if (!fs.existsSync(filePath)) {
			exports.convertToPDF(id, app, connectionManager, function (log, id, error) {
				sendPDF(res, filePath);
			});
		} else {
			sendPDF(res, filePath);
		}
	});
});

function createDocument(id, req, res) {
	if (id) {
		var app = req.app;
		var DocumentModel = req.documentModel;
		var user = req.user;
		var userEmail = user ? user.email : "";
		var isPub     = user ? false : true;
		app.model.create(id, 'text', null, function(error, doc) {
			if (error) {
				if (error == "Document already exists") {
					res.send(500, "Document (ID:" + id + ") already exists.");
				} else {
					res.send(500, "Error during document (ID:" + id + ") creation.");
				}
			} else {
				var document = new DocumentModel({_id: id, users: [userEmail], isPublic: isPub});
				document.save(function (err) {
					if (err) {
						console.log(err);
						app.model.delete(id);
						res.send(500, "Error during document (ID:" + id + ") creation.");
					} else {
						var url = "http://" + req.get('host') + "/document/" + id;
						res.json({ _id: id, uri: url, note: ("Document " + id + " created") });
					}
				});
			}
		});
	}
}

router.get('/document/create', function(req, res) {
	generateUniqueDocID(req, res, function(id) {
		createDocument(id, req, res);
	});
});

router.get('/document/:id/create', function(req, res) {
	var id = req.params.id;
	createDocument(id, req, res);
});

router.get('/document/:id/delete', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		var DocumentModel = req.documentModel;
		var connectionManager = req.connectionManager;
		var latexpath = connectionManager.getLaTeXPath();
		var dataPath = getDocumentFolderPath(connectionManager.getDocsPath(), id);
		app.model.delete(id, function(error, doc) {
			if (error) {
				res.send(500, "Error during document (ID:" + id + ") deletion.");
			} else {
				exports.deleteDocumentFiles(connectionManager.getDocsPath(), id);
				DocumentModel.remove({_id: id}, function(err) {
					if (err) {
						res.send(500, "Error during document (ID:" + id + ") deletion.");
					} else {
						res.send("Document ID:" + id + " deleted!");
					}
				});
			}
		});
	});
});

router.get('/document/:id/content', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		app.model.getSnapshot(id, function(error, doc) {
			if (error) {
				res.send(500, "Error during document (ID:" + id + ") opening.");
			} else {
				res.send(doc.snapshot);
			}
		});
	});
});

router.get('/document/:id', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		var user = req.user;
		var documentModel = req.documentModel;
		documentModel.findOne({_id: id}, function(error, doc) {
			if (doc) {
				app.model.getVersion(id, function(error, docSJS) {
					if (error) {
						res.send(404, "Document ID:" + id + " does not exist!");
					} else {
						res.render('document', {id: id, name: doc.name, user: user});
					}
				});
			} else {
				res.send(404, "Document ID:" + id + " does not exist!");
			}
		});
	});
});

router.post('/document/:id/adduser', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		var newUser = req.body.newUser;
		var DocumentModel = req.documentModel;
		if (newUser && newUser != "") {
			DocumentModel.update({_id: id}, {'$push': {users: newUser}}, function(err) {
				if (err) {
					res.send(500, "Error during adding user:" + newUser + " to document ID: " + id);
				} else {
					res.send(200, "User " + newUser + " added to document ID: " + id);
				}
			});
		} else {
			res.send(200, "No user added to document ID: " + id);
		}
	});
});

router.post('/document/:id/removeuser', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		var removeUser = req.body.removeUser;
		var DocumentModel = req.documentModel;
		DocumentModel.update({_id: id}, {'$pull': {users: removeUser}}, function(err) {
			if (err) {
				res.send(500, "Error during removing user:" + removeUser + " to document ID: " + id);
			} else {
				res.send(200, "User " + removeUser + " removed from document ID: " + id);
			}
		});
	});
});

router.post('/document/:id/rename', function(req, res) {
	hasUserAccess(req, res, function(req, res) {
		var id = req.params.id;
		var app = req.app;
		var newName = req.body.newName;
		if (newName && newName != "") {
			var DocumentModel = req.documentModel;
			DocumentModel.update({_id: id}, {'$set': {name: newName}}, function(err) {
				if (err) {
					res.send(500, "Error during renaming document ID: " + id);
				} else {
					res.send(200, "Document ID: " + id + " renamed to: " + newName);
				}
			});
		} else {
			res.send(200, "Document ID: " + id + " not renamed");
		}
	});
});

router.get('/latex/install/:id', function(req, res) {
	var latexpath = req.connectionManager.getLaTeXPath();
	var packageName = req.params.id;
	if (packageName) {
		var command = latexpath + "tlmgr install " + packageName;
		console.log(command);
		
		exec(command, {cwd: latexpath}, function (error, stdout, stderr) {
			console.log(error);
			console.log(stderr);
			console.log(stdout);
			if (error) {
				res.send(500, "Error during LaTeX package installation");
			} else {
				res.send(200, "LaTeX package " + packageName + " installed");
			}
		});
	} else {
		res.send(500, "No LaTeX package name specified");
	}
});

module.exports.router = router;
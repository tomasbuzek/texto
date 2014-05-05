var express = require('express');
var router = express.Router();

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

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

router.get('/document/:id/pdffile', function(req, res) {
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

router.get('/document/:id/pdf', function(req, res) {
	var id = req.params.id;
	var app = req.app;
	var connectionManager = req.connectionManager;
	var latexpath = connectionManager.getLaTeXPath();
	var dataPath = getDocumentFolderPath(connectionManager.getDocsPath(), id);
	if (!fs.existsSync(dataPath)){ fs.mkdirSync(dataPath); }
	if (id) {
		documentToTempFile(id, app, dataPath, function(error, sourcepath) {
			if (error) {
				res.send(500, "Document (ID:" + id + ") tex creation failed.");
			} else {
				createPDF(sourcepath, app, dataPath, latexpath, function(error, pdffilename){
					if (error) {
						res.send(500, "Document (ID:" + id + ") PDF creation failed.");
					} else {
						var filePath = path.join(dataPath, pdffilename);
					    var stat = fs.statSync(filePath);

					    res.writeHead(200, {
					        'Content-Type': 'application/pdf',
					        'Content-Length': stat.size
					    });

					    var readStream = fs.createReadStream(filePath);
					    readStream.pipe(res);
					}
				});
			}
		});
	} else {
		res.send(500, "ID not specified!");
	}
});

router.get('/document/:id/create', function(req, res) {
	var id = req.params.id;
	var app = req.app;
	if (id) {
		app.model.create(id, 'text', null, function(error, doc) {
			if (error) {
				if (error == "Document already exists") {
					res.send(500, "Document (ID:" + id + ") already exists.");
				} else {
					res.send(500, "Error during document (ID:" + id + ") creation.");
				}
			} else {
				res.send("Document ID:" + id + " created!");
			}
		});
	} else {
		res.send(500, "ID not specified!");
	}
});

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

router.get('/document/:id/delete', function(req, res) {
	var id = req.params.id;
	var app = req.app;
	var connectionManager = req.connectionManager;
	var latexpath = connectionManager.getLaTeXPath();
	var dataPath = getDocumentFolderPath(connectionManager.getDocsPath(), id);
	if (id) {
		app.model.delete(id, function(error, doc) {
			if (error) {
				res.send(500, "Error during document (ID:" + id + ") deletion.");
			} else {
				console.log(dataPath);
				exports.deleteDocumentFiles(connectionManager.getDocsPath(), id);
				res.send("Document ID:" + id + " deleted!");
			}
		});
	} else {
		res.send(500, "ID not specified!");
	}
});

router.get('/document/:id/content', function(req, res) {
	var id = req.params.id;
	var app = req.app;
	if (id) {
		app.model.getSnapshot(id, function(error, doc) {
			if (error) {
				res.send(500, "Error during document (ID:" + id + ") opening.");
			} else {
				res.send(doc.snapshot);
			}
		});
	} else {
		res.send(500, "ID not specified!");
	}
});

router.get('/document/:id', function(req, res) {
		var id = req.params.id;
		var app = req.app;
		app.model.getVersion(id, function(error, doc) {
			if (error) {
				res.send("Document ID:" + id + " does not exist!");
			} else {
				res.render('document', {id: id});
			}
		});
});

module.exports.router = router;
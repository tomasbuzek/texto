var express = require('express');
var router = express.Router();

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

function documentToTempFile(id, app, dataPath, next) {
	app.model.getSnapshot(id, function(error, doc) {
		if (error) {
			next(error, null);
		} else {
			var filename = id + ".tex";
			var filepath = dataPath + filename;
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

function createPDF(sourcefile, app, dataPath, next) {
	var command = "pdflatex -interaction=nonstopmode " + sourcefile;
	console.log(command);
	exec(command, {cwd: dataPath}, function (error, stdout, stderr) {
		if (error) {
			console.log(stderr);
			next(error, null);
		} else {
			var pdffilename = sourcefile.substring(0, sourcefile.length-3) + "pdf";
			next(null, pdffilename);
		}
	});
}

router.get('/document/:id/pdf', function(req, res) {
	var id = req.params.id;
	var app = req.app;
	var connectionManager = req.connectionManager;
	var dataPath = connectionManager.getDataPath();
	if (id) {
		documentToTempFile(id, app, dataPath, function(error, sourcepath) {
			if (error) {
				res.send(500, "Document (ID:" + id + ") tex creation failed.");
			} else {
				createPDF(sourcepath, app, dataPath, function(error, pdffilename){
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

router.get('/document/:id/pdfpath', function(req, res) {
	var id = req.params.id;
	var dataPath = connectionManager.getDataPath();
	if (id) {
		
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

router.get('/document/:id/delete', function(req, res) {
	var id = req.params.id;
	var app = req.app;
	if (id) {
		app.model.delete(id, function(error, doc) {
			if (error) {
				res.send(500, "Error during document (ID:" + id + ") deletion.");
			} else {
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

module.exports = router;
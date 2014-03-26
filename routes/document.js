/**
 * New node file
 */
var documentModelName = 'Document';

var getModel = function(db, documentModelName) {
	return db.model(documentModelName);
}

exports.getDocuments = function(db) {
	return function(req, res) {
		var DocumentModel = getModel(db, documentModelName);
		DocumentModel.find({}, function (err, docs) {
			if (err) {
				res.send("Error during document opening", 500);
			} else {
				res.send(docs);
			}
		});
	}
}

exports.deleteDocuments = function(db) {
	return function(req, res) {
		var DocumentModel = getModel(db, documentModelName);
		DocumentModel.remove({}, function (err, docs) {
			if (err) {
				res.send("Documents not deleted", 500);
			} else {
				res.send("Documents deleted", 200);
			}
		});
	}
}

exports.createDocument = function(db) {
	return function(req, res) {
		var DocumentModel = getModel(db, documentModelName);
		var instance = new DocumentModel();
		if (!req.body.name) {
			res.send("No document name", 500); return;
		}
		instance.name = req.body.name;
		instance.save(function (err) {
			  if (err) {
				  res.send("Document not created", 500);
			  } else {
				  res.send(instance);
			  }
		});
	}
}

exports.modifyDocument = function(db) {
	return function(req, res) {
		var id = req.params.id;
		var name = req.body.name;
		var content = req.body.content;
		if (id) {
			var DocumentModel = getModel(db, documentModelName);
			DocumentModel.findOne({"_id" : id }, function(err, document) {
				  if (err) {
					  res.send("Document does not exist", 404);
				  } else {
					  if (name) { document.name = name; }
					  if (content) { document.content = content; }
					  document.modified = Date(Date.now());
					  document.save(function (err) {
						  if (err) {
							  res.send("Error during document updating", 500);
						  } else {
							  res.send("Document updated", 200);
						  }
					  });
				  }
			});
		}
	}
}

exports.showDocument = function(db) {
	return function(req, res) {
		var id = req.params.id;
		if (id) {
			var DocumentModel = getModel(db, documentModelName);
			DocumentModel.findOne({"_id" : id }, function(err, document) {
				  if (err) {
					  res.send("Error during document opening", 500);
				  } else {
					  if (document) {
						  res.send(document);
					  } else {
						  res.send("Document does not exist", 404);
					  }
				  }
			});
		}
	}
}

exports.deleteDocument = function(db) {
	return function(req, res) {
		var id = req.params.id;
		if (id) {
			var DocumentModel = getModel(db, documentModelName);
			DocumentModel.remove({"_id" : id }, function(err, document) {
				  if (err) {
					  res.send("Document does not exist", 404);
				  } else {
					  res.send("Document removed", 200);
				  }
			});
		}
	}
}
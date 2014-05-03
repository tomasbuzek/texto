var express = require('express');
var router = express.Router();

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
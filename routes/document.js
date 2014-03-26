/**
 * New node file
 */

var documentCollectionName = 'documentcollection';

var getCollection = function(db, collectionName) {
	return db.get(collectionName);
}

exports.getDocuments = function(db) {
	return function(req, res) {
		var collection = getCollection(db, documentCollectionName);
		collection.find({}, {}, function (e, docs) {
			res.send(docs);
		});
	}
}

exports.createDocument = function(db) {
	return function(req, res) {
		var name = req.body.documentname;
		var collection = getCollection(db, documentCollectionName);
		collection.insert({"name" : name,
						   "content" : "",
						   "created" : Date(Date.now()),
						   "modified" : Date(Date.now())});
		res.send("Document created", 200);
	}
}

exports.modifyDocument = function(db) {
	return function(req, res) {
		var id = req.params.id;
		var name = req.body.name;
		var content = req.body.content;
		var collection = getCollection(db, documentCollectionName);
		collection.update(
				{"_id" : id}, {$set : {"name" : name,
									   "content" : content,
									   "modified" : Date(Date.now())}
				});
		res.send("Document updated", 200);
	}
}

exports.showDocument = function(db) {
	return function(req, res) {
		var id = req.params.id;
		var collection = getCollection(db, documentCollectionName);
		collection.find({"_id":id}, {}, function (e, docs) {
			res.send(docs);
		});
	}
}
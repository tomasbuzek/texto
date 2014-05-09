var moment = require('moment');

function getDocumentList(req, res, next) {
	var user = req.user;
	var documentModel = req.documentModel;
	if (user) {
		documentModel.find({users: user.email}, '_id name created users', function(error, doc) {
			if (error) {
				next(error, null);
			} else {
				doc.forEach(function(entry) {
					entry.url = ("http://" + req.get('host') + "/document/" + entry._id);
				});
				next(null, doc);
			}
		});
	} else {
		next("No user", null);
	}
}

module.exports = function(app) {
	app.get('/', function(req, res){
		getDocumentList(req, res, function(error, docs) {
			res.render('index.jade',{ user : req.user, docs: docs, moment: moment });
		});
	});
};
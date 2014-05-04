module.exports = function(app) {
	app.get('/', function(req, res){
		res.render('index.jade',{
			user : req.user
		});
	});
};


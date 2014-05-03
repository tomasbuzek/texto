module.exports = function(app, passport) {

	// LOGIN ===============================
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});
	// app.post('/login', do all our passport stuff here);

	// PROFILE SECTION ==============================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	
	// GOOGLE ROUTES =======================
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',
		passport.authenticate('google', {
			successRedirect : '/',
			failureRedirect : '/'
		}));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

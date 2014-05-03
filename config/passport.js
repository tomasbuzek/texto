var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User       = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

	// GOOGLE ==================================================================
    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL
    },
    function(token, refreshToken, profile, done) {
		console.log(profile);
		process.nextTick(function() {
			console.log('tick');
	        User.findOne({ 'id' : profile.id }, function(err, user) {
	            if (err)
					console.log('err');
	                return done(err);
	            if (user) {
					console.log('user');
	                return done(null, user);
	            } else {
					console.log('new');
	                var newUser          = new User();
	                newUser.id    = profile.id;
	                newUser.token = token;
	                newUser.name  = profile.displayName;
	                newUser.email = profile.emails[0].value;
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;
	                    return done(null, newUser);
	                });
	            }
	        });
	    });
    }));
};

// configuration ======================================================================
var databaseHost 		= process.env.OPENSHIFT_MONGODB_DB_HOST;
var databasePort 		= process.env.OPENSHIFT_MONGODB_DB_PORT;
var databaseUsername 	= process.env.OPENSHIFT_MONGODB_DB_USERNAME;
var databasePassword 	= process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
var databaseName 		= "texto";

var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port 	  = process.env.OPENSHIFT_NODEJS_PORT || 8000;

// configuration getters ======================================================================
exports.getHostIP = function() {
	if (typeof ipAddress === "undefined") {
	    console.warn('Running on localhost');
	    ipAddress = "127.0.0.1";
	};
	
	return ipAddress;
}

exports.getHostPort = function() {
	return port;
}

exports.getHostIPAndPort = function() {
	return exports.getHostIP() + ":" + exports.getHostPort();
}

exports.getShareJSChannelUR = function() {
	return exports.getHostIP() + ":" + exports.getHostPort() + "/js/channel";
}

exports.getDatabaseURL = function() {
	if (typeof databaseHost === "undefined") {
		console.warn('Localhost database connection');
		databaseUsername = "";
		databasePassword = "";
		databaseHost = "127.0.0.1";
		databasePort = 27017;
	};
	
	var connectionString =  "mongodb://" +
	databaseUsername + ":" + databasePassword + "@" +
	databaseHost 	 + ":" + databasePort 	  + "/" +
	databaseName;
	
	return connectionString;
}

exports.getShareOptions = function() {
	var options = {
		db: {
			type: 'mongo',
			uri: exports.getDatabaseURL()
		},
		port: exports.getHostPort()
	};
	return options;
}

// database connection ======================================================================
var mongoose = require('mongoose');
var database;

exports.connectDB = function() {
	var connectionString = exports.getDatabaseURL();
	database = mongoose.connect(connectionString);
	return database;
}

exports.closeDB = function() {
	if (database != "undefined") {
		console.log('%s: Closing connection to database.', Date(Date.now()) );
		database.connection.close()
	}
}


var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port 	  = process.env.OPENSHIFT_NODEJS_PORT || 8000;

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

/**
 * Database connection configuration
 */
var db = require('mongoose');
var database;
/**
 * OpenShift database login
 */
var databaseHost 		= process.env.OPENSHIFT_MONGODB_DB_HOST;
var databasePort 		= process.env.OPENSHIFT_MONGODB_DB_PORT;
var databaseUsername 	= process.env.OPENSHIFT_MONGODB_DB_USERNAME;
var databasePassword 	= process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
var databaseName 		= "texto";

/**
 * Database connection
 */
exports.getDatabaseURL = function() {
	/**
	 * Local database login
	 */
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

exports.connectDB = function() {
	var connectionString = exports.getDatabaseURL();
	
	database = db.connect(connectionString);
	
	return database;
}

/**
 * Closing of database connection
 */
exports.closeDB = function() {
	if (database != "undefined") {
		console.log('%s: Closing connection to database.', Date(Date.now()) );
		database.connection.close()
	}
}

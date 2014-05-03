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
var databaseName 		= process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

/**
 * Database connection
 */
exports.connect = function() {
	/**
	 * Local database login
	 */
	if (typeof databaseHost === "undefined") {
		console.warn('Localhost database connection');
		databaseUsername = "";
		databasePassword = "";
		databaseName = "texto";
		databaseHost = "127.0.0.1";
		databasePort = 27017;
	};
	
	var connectionString =  "mongodb://" +
	databaseUsername + ":" + databasePassword + "@" +
	databaseHost 	 + ":" + databasePort 	  + "/" +
	databaseName;
	
	database = db.connect(connectionString);
	
	return database;
}

/**
 * Closing of database connection
 */
exports.close = function() {
	if (database != "undefined") {
		console.log('%s: Closing connection to database.', Date(Date.now()) );
		database.connection.close()
	}
}


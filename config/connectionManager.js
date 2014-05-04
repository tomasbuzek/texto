var fs = require('fs');

var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port 	  = process.env.OPENSHIFT_NODEJS_PORT || 8000;

var dataPath = process.env.OPENSHIFT_DATA_DIR;

exports.getDataPath = function() {
	if (typeof dataPath === "undefined") {
		dataPath = "./data/";
		if (!fs.existsSync(dataPath)){
			fs.mkdirSync(dataPath);
		}
	};
	var docsDataPath = dataPath + "docs/";
	if (!fs.existsSync(docsDataPath)){
		fs.mkdirSync(docsDataPath);
	}
	return docsDataPath;
}


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
var databaseUsername 	= "admin";//process.env.OPENSHIFT_MONGODB_DB_USERNAME;
var databasePassword 	= "kP25MpqWgCET";//process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
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
	databaseHost 	 + ":" + databasePort;// 	  + "/" +
	//databaseName;
	
	return connectionString;
}

exports.connectDB = function() {
	var connectionString = exports.getDatabaseURL();
	console.log(connectionString);
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

/**
 * Redis database
 */
var redisIP = process.env.OPENSHIFT_REDIS_HOST;
var redisPort = process.env.OPENSHIFT_REDIS_PORT;
var redisAuth = process.env.REDIS_PASSWORD;
exports.getRedisIP = function() {
	return redisIP;
	/*if (typeof ipAddress === "undefined") {
		return "127.0.0.1";
	} else {
		return process.env.OPENSHIFT_REDIS_HOST;
	}*/
}

exports.getRedisPort = function() {
	return redisPort;
	/*if (typeof ipAddress === "undefined") {
		return 6379;
	} else {
		return process.env.OPENSHIFT_REDIS_PORT;
	}*/
}

exports.getRedisAuth = function() {
	return redisAuth;
	//"ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5"
	/*if (typeof ipAddress === "undefined") {
		return null;
	} else {
		return process.env.REDIS_PASSWORD;
	}*/
}
var connect = require('connect'),
    sharejs = require('share');
/*var express = require('express');
var fs = require('fs');

var app = express();
app.use("/", express.static(__dirname + '/public'));*/
/*
app.get('/', function(req, res){
	fs.readFile('public/index.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end();
	});
});
app.get('/pdf.viewer/viewer.html', function(req, res){
	fs.readFile('public/pdf.viewer/viewer.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end();
	});
});
*/


var server = connect(
        connect.logger(),
        connect.static(__dirname + '/public')
      );

  var options = {db: {type: 'none'}};
  sharejs.server.attach(server, options);

  server.listen(8000);
  console.log('Server running at http://127.0.0.1:8000/');



/*var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});*/
/*
var server = connect(
      connect.logger(),
      connect.static(__dirname + '/public')
    );
var options = {db: {type: 'none'}}; // See docs for options. {type: 'redis'} to enable persistance.

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(server, options);

server.listen(8000, function(){
    console.log('Server running at http://127.0.0.1:8000/');
});
*/

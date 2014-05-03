var http = require('http');
var fs = require('fs');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    fs.readFile('public/index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    })
});

module.exports = router;
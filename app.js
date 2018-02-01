// all the requires
var path = require('path');
var express = require('express');
var app = express();

// this server gonna run on this port
app.set('port', 8080);

// static directory
app.use(express.static(path.join(__dirname, 'frontend')));

// node modules
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')));

// Listen for requests
var server = app.listen(app.get('port'), function(){
	var port = server.address().port;
	console.log("Magic happens on port " + port);
});

'use strict'
var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');
var errorHandler = require('./error').errorHandler;
var socketChat = require('./socket-chat');
var mongoose = require('mongoose');

var db=mongoose.connect(config.get('dburl'));

var app = express();

//app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

//set all the routes here.
router(app);

//Error handling always should be last.
app.use(errorHandler);

var port = Number(process.env.PORT || config.get('port'))

var server = app.listen(port, function () {
	console.log('Server is running on port: ' + port);
});

socketChat(server);
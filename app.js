var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var routes = require('./routes/index');

// Connect to database
mongoose.connect(config.database);
app.set('superSecret', config.secret);

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

// To parse request params in req.body json format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Routes
app.use('/', routes);

module.exports = app;
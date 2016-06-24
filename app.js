var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express3-handlebars');
var mongoose = require('mongoose');
var config = require('./config');
var routes = require('./routes/index');

// Connect to database
app.set('superSecret', config.secret);
mongoose.connect(config.database, function(err) {
	if (err) {
		throw 'MongoDB: Refused connection';
	}
	console.log('MongoDB: Successfully connected');
});

// Configs
app.use(logger('dev'));

// Template engine
app.engine('hbs', exphbs({
	extname: 'hbs',
	defaultLayout: 'unlogged/main.hbs'
}));
app.set('view engine', 'hbs');

// Views
app.use('/static', express.static(__dirname + '/static'));
app.use('/views', express.static(__dirname + '/views'));

// To parse request params in req.body json format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// Routes
app.use('/', routes);

module.exports = app;
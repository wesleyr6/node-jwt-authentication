var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express3-handlebars');
var expressSession = require('express-session');
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

// Views
app.use('/static', express.static(__dirname + '/static'));
app.use('/views', express.static(__dirname + '/views'));

// Configs
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(expressSession({
	secret: process.env.SESSION_SECRET || 'safadao',
	resave: false,
	saveUninitialized: false
}));

// Template engine
app.engine('hbs', exphbs({
	extname: 'hbs',
	defaultLayout: 'unlogged/main.hbs'
}));
app.set('view engine', 'hbs');

// Routes
app.use('/', routes);

module.exports = app;
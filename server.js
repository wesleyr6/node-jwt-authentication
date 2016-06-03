var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;
var config = require('./config');
var User = require('./models/user'); // get our mongoose model
var port = process.env.PORT || 3000; // used to create, sign, and verify tokens

// Connect to database
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// To parse request params in req.body json format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
 }));

// Dynamic routes
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/setup', function(req, res) {
	// create a sample user
	var nick = new User({
		name: 'Nick Cerminara',
		password: 'password',
		admin: true
	});

	// save the sample user
	nick.save(function(err) {
		if (err) {
			throw err;
		}

		console.log('User saved successfully');

		res.json({
			success: true
		});
	});
});

// API ROUTES -------------------
// get an instance of the router for api routes
var apiRoutes = express.Router();

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
	res.json({
		message: 'Welcome to the coolest API on earth!'
	});
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
	//console.log(req);
	console.log(req.params);
	console.log(req.param.name);
	console.log(req.body);

	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {
		if (err) {
			throw err;
		}

		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found. ' + user
			});
		} else if (user) {
			// check if password matches
			if (user.password !== req.body.password) {
				res.json({
					success: false,
					message: 'Authentication failed. Wrong password.'
				});
			} else {
				// if user is found and password is right
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresInMinutes: 1440 // expires in 24 hours
				});

				// return the information including token as JSON
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});
});

// TODO: route middleware to verify a token
apiRoutes.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	} else {
		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// Starting server
app.listen(port);
console.log('Server running port ' + port);
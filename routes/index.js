var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var router = express.Router();

router.get('/', function(req, res) {
	res.status(200).send('Hello!');
});

router.get('/setup', function(req, res) {
	// create a sample user
	var nick = new User({
		name: 'Wesley Amaro',
		password: 'ps654321',
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

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/authenticate', function(req, res) {
	console.log(req.body);

	// find the user
	User.findOne({
		name: req.body.username
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
				var token = jwt.sign(user, req.app.get('superSecret'), {
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

// route to return all users (GET http://localhost:8080/api/users)
router.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

// TODO: route middleware to verify a token
router.use(function(req, res, next) {
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
				// if everything is good, save to request for use in other router
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

module.exports = router;
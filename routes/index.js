var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var bcrypt = require('bcrypt');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('index', {
		title: 'Home - MyApp',
		layout: req.session.token ? 'logged/main.hbs' : 'unlogged/main.hbs',
		bodyClass: req.session.token ? 'logged' : 'unlogged',
		isAuthenticated: req.session.isAuthenticated,
		user: {
			token: req.session.token
		}
	});
});

router.post('/', function(req, res) {
	var _res = res;

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
			bcrypt.compare(req.body.password, user.password, function(err, res) {
				if (res) {
					// if user is found and password is right
					// create a token
					var token = jwt.sign(user, req.app.get('superSecret'), {
						expiresIn: '24h'
					});

					req.session.isAuthenticated = true;
					req.session.token = token;

					_res.redirect('/');
				} else {
					throw 'Authentication failed. Wrong password.';
				}
			});
		}
	});
});

router.get('/logout', function(req, res) {
	if(req.session){
		req.session.destroy();
	}
	res.redirect('/')
});

router.get('/signup', function(req, res) {
	res.render('signup', {
		title: 'SignUp - MyApp',
		layout: 'unlogged/main.hbs',
		bodyClass: 'unlogged'
	});
});

router.post('/signup', function(req, res) {
	var signupUser;

	if (req.body.password !== req.body.passwordConfirm) {
		throw 'Incorrect password confirmation';
	}

	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(req.body.password, salt, function(err, hash) {
			signupUser = new User({
				name: req.body.username,
				password: hash,
				securityPhrase: req.body.securityPhrase
			});

			signupUser.save(function(err) {
				if (err) {
					throw err;
				}

				console.log('SignUp: User saved successfully');

				res.redirect('/');
			});
		});
	});
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

// TODO: route middleware to verify a token
router.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.session.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, req.app.get('superSecret'), function(err, decoded) {
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				//console.log(decoded);
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
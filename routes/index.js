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

	User.findOne({ name: req.body.username }, function(err, user) {
		if (err) throw err;

		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found. ' + user
			});
		} else {
			bcrypt.compare(req.body.password, user.password, function(err, res) {
				if (res) {
					var token = jwt.sign(user.toJSON(), req.app.get('superSecret'), { expiresIn: 604800 });
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
	if(req.session) req.session.destroy();
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
	if (req.body.password !== req.body.passwordConfirm)
		throw 'Incorrect password confirmation';

	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(req.body.password, salt, function(err, hash) {
			var signupUser = new User({
				name: req.body.username,
				password: hash,
				securityPhrase: req.body.securityPhrase
			});

			signupUser.save().then(function() {
				console.log('SignUp: User saved successfully');
				res.redirect('/');
			}).catch(function(err) {
				throw err
			});
		});
	});
});

router.get('/setup', function(req, res) {
	var nick = new User({
		name: 'admin',
		password: 'admin',
		admin: true
	});

	nick.save().then(function(){
		console.log('User saved successfully');
		res.json({
			success: true
		});
	}).catch(function(err) {
		throw err
	});
});

router.use(function(req, res, next) {
	var token = req.session.token || req.headers['x-access-token'];

	if (token) {
		jwt.verify(token, req.app.get('superSecret'), function(err, decoded) {
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

module.exports = router;
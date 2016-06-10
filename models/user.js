// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var User = new Schema({
	name: String,
	password: String
});

module.exports = mongoose.model('User', User);
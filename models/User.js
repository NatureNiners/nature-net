var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/naturenet");
mongoose.connect("mongodb://nature_niners:nature123@ds123929.mlab.com:23929/naturenet");
var passportLocalMongoose= require('passport-local-mongoose');
var Action= require('./Action');


var userSchema= new mongoose.Schema({
	firstName: String,
	lastName: String,
	username: String,
	email: String,
	password: String,
	phoneNumber: Number,
	subscription: String,
	dob: Date,
	posts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Action"
	}],
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

userSchema.plugin(passportLocalMongoose);

var User= mongoose.model("User",userSchema);
module.exports= User;

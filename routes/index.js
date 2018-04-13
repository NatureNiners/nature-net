var express= require('express');
var router= express.Router({mergeParams: true});
var passport= require('passport');
var User = require('../models/User');

var nodemailer= require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'natureniners@gmail.com',
    pass: 'ITis@6177'
  }
});

router.get("/users/new",function(req,res){
	res.render("register.ejs");
});

router.post("/users",function(req,res){
var	firstName= req.body.firstName;
var	lastName= req.body.lastName;
var	email= req.body.email;
var	password= req.body.password;
var	phone= req.body.phone;
var	subscription= req.body.subscription;
var	dob= req.body.dob;
var username= req.body.username;


var newUser= new User({username: username,firstName: firstName, lastName: lastName, email: email,phone: phone,subscription:subscription,dob: dob});
User.register(newUser,password, function(err,user){
if(err){
	console.log(err);
	return res.redirect("/");
}


var mailOptions = {
  							from: 'natureniners@gmail.com',
  							to: email,
  							subject: 'Welcome to Nature Niners',
  							html:'<p>Greetings from Nature Niners,</p><p>Thank you for signing up for Natre Niners application. Nature Niners is a citizen Science community where you can contribute to the nature by participating in various events and supporting different causes.To See a list of current actions, <a href="http://localhost:3000/actions">Click here.</a></p><p>Welcome to the community!</p><p>--The Nature Niners Team</p>'
							};
		transporter.sendMail(mailOptions, function(error, info){
  			if (error) {
    					console.log(error);
  			} else {
    					console.log('Email sent: ' + info.response);
  			}
			});

	res.redirect("/login");
	console.log(user);
// });
});
});

router.get("/login",function(req,res){
	res.render("login.ejs");
});

router.post("/login",passport.authenticate("local",{
	successRedirect: "/home",
	failureRedirect: "/login"
}),function(req,res){
});

router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/home");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports= router;


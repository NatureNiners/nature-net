var express= require('express');
var app= express();
var bodyParser= require('body-parser');
var User= require('./models/User');
var Action= require('./models/Action');
var Comment= require('./models/Comment');
var Event= require('./models/Event');
var methodOverride= require('method-override');

var async= require('async');

var passport= require('passport');
var localStrategy= require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');

var nodemailer= require('nodemailer');


var schedule= require('node-schedule');
var Q = require('q'),
moment = require('moment'),
ejs= require('ejs');

module.exports = app;

var indexRoutes = require('./routes/index');
var  actionRoutes = require('./routes/actions');
var commentRoutes = require('./routes/comments');
var newsLetter = require('./routes/newsletter');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//Passport Configuration
app.use(require('express-session')({
	secret: "NatureNiners working on Nature-Net application",
	resave: true,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'natureniners@gmail.com',
    pass: 'ITis@6177'
  }
});

app.use(indexRoutes);
app.use("/actions",actionRoutes);
app.use("/actions/:id/comment",commentRoutes);
app.get("/comments",function(req,res){

Comment.find({},function(err,comments){
	if(err){
		console.log(err);
	}
	else {
		res.status(200).json(comments);
		//res.render("actions.ejs",{actions: actions});	
	}
})
});

app.get("/newsletter/actions",function(req,res){
	var days=1;
	var date= new Date();
	var last= new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
	console.log(last);
	Action.find({},function(req,actions){
		var news= new Array();
		async.each(actions,function(action,callback){
			if(action.pubDate < date && action.pubDate> last){
			console.log("its here!");
			//console.log(action);
			news.push(action);						
		}
		
	});	
		res.render("email.ejs",{Content: news});
		});	
		
});

app.get("/home",function(req,res){
	res.send("Welcome");
});

app.get("/",function(req,res){
	res.redirect("/users/new");
});

app.listen(3000,function(){
	console.log("Server started at port 3000");
});
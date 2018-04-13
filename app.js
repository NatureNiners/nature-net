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
mailgun_api = process.env.MAILGUN_API_KEY,
mailgun_domain = process.env.MAILGUN_DOMAIN,
Mailgun = require('mailgun-js'),
Q = require('q'),
moment = require('moment'),
nunjucks = require('nunjucks');

var ejs= require('ejs');

module.exports = app;

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


app.get("/users/new",function(req,res){
	res.render("register.ejs");
});

app.post("/users",function(req,res){
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
	return res.redirect("/register");
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

app.get("/login",function(req,res){
	res.render("login.ejs");
});

app.post("/login",passport.authenticate("local",{
	successRedirect: "/home",
	failureRedirect: "/login"
}),function(req,res){
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/home");
});

app.get("/actions",isLoggedIn,function(req,res){

Action.find({},function(err,actions){
	if(err){
		console.log("forbidden");
	}
	else {
		res.status(200).json(actions);
		console.log("middleware route");
		//res.render("actions.ejs",{actions: actions});	
	}
})
});

app.get("/actions/new",function(req,res){
	res.render("createAction.ejs");
});

app.post("/actions",isLoggedIn, function(req,res){
	var Title= req.body.title;
	var	Topic= req.body.topic;
	var Content= req.body.content;
	//var Email= req.body.email;
	var Location= req.body.location;
	var startTime= req.body.startTime;
	var endTime= req.body.endTime;
	var expAudience= req.body.expLikes;
	var author= {
		id: req.user._id,
		username: req.user.username
	}
	Action.create({title: Title, topic: Topic, content: Content, location: Location,startTime: startTime,endTime: endTime,expLikes: expAudience, author: author},function(err,newAction){
		User.findById(req.user._id,function(err, foundUser){
			if(err){
		console.log("Couldn't find the user");
	} 
	else{
		
		foundUser.posts.push(newAction._id);
		foundUser.save(function(err, data){
		if(err){
		console.log("Couldn't add the post");
		} 
		else{
		res.status(200).json(data);
		console.log("Sucessfully inserted: " +data);
		//res.redirect("/actions");
		}
		});
		}
	});

});
});

app.get("/actions/:id",isLoggedIn,function(req,res){
	Action.findById(req.params.id).populate("comments").exec(function(err,foundAction){
		if(err){
		console.log(err);
	} 
	else{
		count=0;
		async.each(foundAction.comments,function(comment,callback){
			if(comment.like==true){
				count++;
		foundAction.set('likes_Count',count);
		foundAction.save();
		return callback('Successful');
		// res.redirect("/actions"+req.params.id+"/comments"+comment._id);
		// console.log("successful");
			}	
		});
		if(foundAction.likes_Count>=2){
				console.log("Control is here");
				res.redirect("/events/"+req.params.id);
			}
			else{
				res.status(200).json(foundAction);
			}
		//res.status(200).json(foundAction);
	}
	});
});

app.get("/actions/:id/edit",function(req,res){
	Action.findById(req.params.id, function(err,foundAction){
	if(err){
		console.log(err);
	} 
	else{
		res.render("edit.ejs",{foundAction: foundAction});
	}	
});
});

app.put("/actions/:id",checkAuthor, function(req,res){

		Action.findByIdAndUpdate(req.params.id, req.body, function(err,updateAction){
		if(err){
		res.redirect("/actions");
	} 
	else{
		res.redirect("/actions/"+updateAction._id);
	}
	});
});

app.delete("/actions/:id",checkAuthor,function(req,res){
	Action.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/actions");

	}else{
		res.redirect("/actions");
		}
	});
});

app.get("/users/:id/actions",isLoggedIn, function(req,res){
	User.findById(req.params.id).populate("posts").exec(function(err,userActions){
	if(err){
			console.log(err);

	}else{
		res.status(200).json(userActions);
		console.log(userActions);
		//res.render("userActions.ejs",{userActions: userActions});
		}
	});
});


// ####

// Comments and Likes 

// ##### 


app.post("/actions/:id/comment",isLoggedIn, function(req,res){
	//var Name= req.user.username;
	var	Text= req.body.text;
	var Like= req.body.like;
	var name= {
		id: req.user._id,
		username: req.user.username
	}
	Action.findById(req.params.id,function(err,foundAction){
		if(err){
		console.log(err);
	} 
	else{
		Comment.create({name: name, text: Text, like: Like},function(err,newComment){
	
		User.findById(req.user._id,function(err, foundUser){
			if(err){
		console.log("Couldn't find the email");
	} 	
	else{
		newComment.name.id= req.user._id;
		console.log(newComment.name.id);
		newComment.name.username= req.user.username;
		console.log(newComment.name.username);
		newComment.save();
		foundUser.comments.push(newComment._id);
		foundUser.save();
		foundAction.comments.push(newComment);
		console.log(newComment);
		foundAction.save(function(err, data){
		if(err){
		console.log("Couldn't send the comment");
		} 
		else{
		res.redirect("/actions/"+req.params.id);
		//res.status(200).json(data);
		console.log("Sucessfully inserted: " +data);
		//res.redirect("/actions");
		}
		});
		}
	});
	});
	}
	});	
});

app.put("/actions/:id/comment/:comment_id",checkCommentAuthor, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body, function(err,updateComment){
		if(err){
			console.log(err);
	} 
	else{
		if(req.body.like==false){
			Action.findById(req.params.id).populate("comments").exec(function(err,foundAction){
		if(err){
		console.log(err);
	} 
	else{
		count=foundAction.likes_Count;
		count--;
		foundAction.set('likes_Count',count);
		foundAction.save();
		console.log(foundAction.likes_Count);
		//res.status(200).json(foundAction);
	}
	});
		}
				console.log(updateComment);

		res.redirect("/actions/"+req.params.id);

	}
	});
});

app.delete("/actions/:id/comment/:comment_id",checkCommentAuthor, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, req.body, function(err,updateComment){
		if(err){
		res.status(403).send('Unauthorized');
	} 
	else{
		console.log(updateComment);
		res.redirect("/actions/"+req.params.id);

	}
	});
});

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


app.get("/events/:id",function(req,res){

Action.findById(req.params.id).populate("comments").exec(function(err,Events){
	if(err){
			console.log(err);

	}else{
		var id= req.params.id;
		if(!Events.events.map(id=>id.toString()).includes(id)){
				Events.events.push(req.params.id);
				Events.save();
				console.log("added in events array");
			}
			else{
				console.log("already in the events section");
		}
		res.status(200).json(Events);
		}
	});
});

// var days=1;
// 	var date= new Date();
// 	var day =date.getDate();
// 	var month=date.getMonth();
// 	var year=date.getFullYear();
// var date1 = new Date(year, month, day, 17, 30, 0);
// console.log("Hello "+date1);
// var j = schedule.scheduleJob(date1, function(){	
//   console.log('Mail functionality');
// });

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
	// 	for(let i = 0, l = news.length; i < l; i++) {
	// 	var news_content= new Array(); 
	// 	news_content= {
	// 		title: news[i].title,
	// 		content: news[i].content,
	// 		id: news[i]._id
	// 	}
	// 	console.log(news_content);
	// }
	//res.json(news);
		res.render("email.ejs",{Content: news});
		});	
		
});


//####### 

//E-mail Functionality 

//#########


    var deffered = Q.defer();

	var days=1;
	var date= new Date();
	var day =date.getDate();
	var month=date.getMonth();
	var year=date.getFullYear();
	var date1 = new Date(year, month, day, 13,30, 0);

 	var job= schedule.scheduleJob(date1,function(){
 	let templateData= {
 		name: 'Test Data'
 	};

 	User.find({'subscription': 'Monthly'},function(err, user){
    var users = [];
    // handle error
    if (err) {
      deffered.reject(console.log('failed: ' + err));
    } else {
      // add all qualifying users to the users array
      for (var i = user.length - 1; i >= 0; i--) {        
        users.push(user[i]);
        console.log(users);
      }  
      deffered.resolve(users);
    }    
  });
 		var news= [];
		var last= new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
		console.log(last);
			Action.find({},function(req,actions){
    		for(i=0; i<actions.length; i++){
    			if(actions[i].pubDate < date && actions[i].pubDate> last){
					news.push(actions[i]);						
				}
    		}
  			ejs.renderFile('views/email.ejs', {Content: news}, (err, content)=> {
  				if(err){
  					console.log(err);
  				}
  				else{
  					User.find({'subscription': 'Yearly'},function(err,user){
  					for(var i = user.length - 1; i >= 0; i--){

  					var mailOptions = {
  							from: 'natureniners@gmail.com',
  							to: user[i].email,
  							subject: 'Latest Actions',
  							html: content
							};
			transporter.sendMail(mailOptions, function(error, info){
  			if (error) {
    					deffered.reject(console.log('failed: ' + err));
  			} else {
    					deffered.resolve(body)
    					console.log('Email sent: ' + info.response);
  			}
			});

			}
  					});
			}
  			});
		});
 });

app.get("/home",function(req,res){
	res.send("Welcome");
});

app.get("/",function(req,res){
	res.redirect("/users/new");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

function checkAuthor(req,res,next){
	if(req.isAuthenticated()){
		Action.findById(req.params.id,function(err,foundAction){
			if(err){
				console.log(err);
			}
			else{
		if(foundAction.author.id.equals(req.user._id)){
			return next();
		}
		else{
			res.status(403).send("You are not Authorized!");
	console.log("You are not Authorized!")
		}
	}
	});
	}
	else{
	res.redirect("/login");
}
}

function checkCommentAuthor(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err){
				console.log(err);
			}
			else{
				console.log(foundComment.name.id);
				console.log(req.user._id);
		if(foundComment.name.id.equals(req.user._id)){
			return next();
		}
		else{
			res.status(403).send("You are not Authorized!");
	console.log("You are not Authorized!");
		}
	}
	});
	}
	else{
		res.redirect("/login");

}
}

app.listen(3000,function(){
	console.log("Server started at port 3000");
});
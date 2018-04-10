var express= require('express');
var app= express();
var bodyParser= require('body-parser');
var User= require('./models/User');
var Action= require('./models/Action');
var Comment= require('./models/Comment');
var Event= require('./models/Event');
var methodOverride= require('method-override');
var async= require('async');
module.exports = app;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(methodOverride("_method"));
app.set("view engine", "ejs");


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
var Users= [{firstName,lastName,email,password,phone,subscription,dob}];
User.create(Users,function(err,newUser){
	if(err){
		res.status(500).send(err);
		console.log("Couldn't insert the user");
	} 
	else{
		res.status(201).json(newUser);
		console.log("Sucessfully inserted:" +newUser);
		//res.redirect("/login");
	}
});
});

app.get("/login",function(req,res){
	res.render("login.ejs");
});

app.post("/login",function(req,res){
	var	Email= req.body.email;
	var	Password= req.body.password;
	console.log(Email);
	console.log(Password);
	User.findOne({email: Email},function(err,foundUser){
		if(err){
		res.status(500).send(err);
		console.log("This error is thrown "+err);
	} 
	else{
		console.log("FoundUser:" +foundUser);
		if(foundUser.password === Password){
			console.log("login successful");
			res.status(200).json(foundUser);
			//res.redirect("/actions/new");
		} else{
			res.status(200).send("Invalid Credentials");
			console.log("login failed");	
	}
	}
	});
});

app.get("/actions",function(req,res){

Action.find({},function(err,actions){
	if(err){
		console.log(err);
	}
	else {
		res.status(200).json(actions);
		//res.render("actions.ejs",{actions: actions});	
	}
})
});

app.get("/actions/new",function(req,res){
	res.render("createAction.ejs");
});

app.post("/actions",function(req,res){
	var Title= req.body.title;
	var	Topic= req.body.topic;
	var Content= req.body.content;
	var Email= req.body.email;
	Action.create({title: Title, topic: Topic, content: Content},function(err,newAction){
		
		User.findOne({email: Email},function(err, foundUser){
			if(err){
		console.log("Couldn't find the email");
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

app.get("/actions/:id",function(req,res){
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
		return callback('successful');
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
		console.log("successful");
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

app.put("/actions/:id",function(req,res){
		Action.findByIdAndUpdate(req.params.id, req.body, function(err,updateAction){
		if(err){
		res.redirect("/actions");
	} 
	else{
		res.redirect("/actions/"+updateAction._id);
	}
	});
});

app.delete("/actions/:id",function(req,res){
	Action.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/actions");

	}else{
		res.redirect("/actions");
		}
	});
});

app.get("/users/:id/actions",function(req,res){
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


app.post("/comment/:id",function(req,res){
	var Name= req.body.name;
	var	Text= req.body.text;
	var Email= req.body.email;
	var Like= req.body.like;
	Action.findById(req.params.id,function(err,foundAction){
		if(err){
		console.log(err);
	} 
	else{
		Comment.create({name: Name, text: Text, like: Like},function(err,newComment){
	
		User.findOne({email: Email},function(err, foundUser){
			if(err){
		console.log("Couldn't find the email");
	} 
	else{
		foundAction.comments.push(newComment._id);
		foundAction.save();

		// foundAction.likes_Count.push(count);
		// foundAction.save();
		foundUser.comments.push(newComment._id);
		foundUser.save(function(err, data){
		if(err){
		console.log("Couldn't send the comment");
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

Action.findById(req.params.id,function(err,Events){
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

app.get("/home",function(req,res){
	res.send("Welcome");
});

app.get("/",function(req,res){
	res.redirect("/users/new");
});

app.listen(3000,function(){
	console.log("Server started at port 3000");
});
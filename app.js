var express= require('express');
var app= express();
var bodyParser= require('body-parser');
var User= require('./models/User');
var Action= require('./models/Action');
var methodOverride= require('method-override');

app.use(bodyParser.urlencoded({extended: true}));
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
		console.log("Couldn't insert the user");
	} 
	else{
		console.log("Sucessfully inserted:" +newUser);
		res.redirect("/login");
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
		console.log("This error is thrown "+err);
	} 
	else{
		console.log("FoundUser:" +foundUser);
		if(foundUser.email===  Email && foundUser.password === Password){
			console.log("login successful");
			res.redirect("/actions/new");
		} else{
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
		res.render("actions.ejs",{actions: actions});	
	}
})
});

app.get("/actions/new",function(req,res){
	res.render("createAction.ejs");
});

app.post("/actions",function(req,res){
	var title= req.body.title;
	var	topic= req.body.topic;
	var content= req.body.content;
	var Email= req.body.email;
	var action= [{title, topic, content}];
	Action.create(action,function(err,newAction){
		if(err){
		console.log("Couldn't add the post");
		} 
		else{
		console.log("Sucessfully inserted:" +newAction);
		res.redirect("/actions");
		}
	// 	User.findOne({email: Email},function(err, foundUser){
	// 		if(err){
	// 	console.log("Couldn't find the email");
	// } 
	// else{
	// 	foundUser.posts.push(newAction);
	// 	foundUser.save(function(err, data){
	// 	if(err){
	// 	console.log("Couldn't add the post");
	// 	} 
	// 	else{
	// 	console.log("Sucessfully inserted:" +data);
	// 	res.redirect("/actions");
	// 	}
	// 	});
	// 	}
	// });

		
});
});

app.get("/actions/:id",function(req,res){
	Action.findById(req.params.id,function(err,foundAction){
		if(err){
		console.log(err);
	} 
	else{
		res.render("showAction.ejs",{action: foundAction});
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
		Action.findByIdAndUpdate(req.params.id, req.body.action, function(err,updateAction){
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

app.get("/home",function(req,res){
	res.send("Welcome");
});

app.listen(3000,function(){
	console.log("Server started at port 3000");
});
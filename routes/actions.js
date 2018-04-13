var express= require('express');
var router= express.Router({mergeParams: true});
var passport= require('passport');
var User = require('../models/User');
var Action = require('../models/Action');
var async= require('async');


router.get("/",isLoggedIn,function(req,res){

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

router.get("/new",function(req,res){
	res.render("createAction.ejs");
});

router.post("/",isLoggedIn, function(req,res){
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

router.get("/:id",isLoggedIn,function(req,res){
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
			}	
		});
		if(foundAction.likes_Count>=2){
				console.log("Control is here");
				res.redirect("/actions/events/"+req.params.id);
			}
			else{
				console.log("CHECK ");
				res.status(200).json(foundAction);
			}
	}
	});
});

router.get("/:id/edit",function(req,res){
	Action.findById(req.params.id, function(err,foundAction){
	if(err){
		console.log(err);
	} 
	else{
		res.render("edit.ejs",{foundAction: foundAction});
	}	
});
});

router.put("/:id",checkAuthor, function(req,res){

		Action.findByIdAndUpdate(req.params.id, req.body, function(err,updateAction){
		if(err){
		res.redirect("/actions");
	} 
	else{
		res.redirect("/actions/"+updateAction._id);
	}
	});
});

router.delete("/:id",checkAuthor,function(req,res){
	Action.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/actions");

	}else{
		res.redirect("/actions");
		}
	});
});

router.get("/useractions/:id",isLoggedIn, function(req,res){
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

router.get("/events/:id",isLoggedIn,function(req,res){

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

module.exports= router;

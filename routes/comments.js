var express= require('express');
var router= express.Router({mergeParams: true});
var passport= require('passport');
var User = require('../models/User');
var Action = require('../models/Action');
var Comment = require('../models/Comment');
var async= require('async');


router.post("/",isLoggedIn, function(req,res){
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

router.put("/:comment_id",checkCommentAuthor, function(req,res){
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

router.delete("/:comment_id",checkCommentAuthor, function(req,res){
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

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
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

module.exports= router;



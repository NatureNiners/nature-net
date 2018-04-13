var express= require('express');
var User = require('../models/User');
var Action = require('../models/Action');
var nodemailer= require('nodemailer');
var schedule= require('node-schedule');
var Q = require('q'),
moment = require('moment'),
ejs= require('ejs');


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'natureniners@gmail.com',
    pass: 'ITis@6177'
  }
});

  var deffered = Q.defer();
	var date= new Date();
	var day =date.getDate();
	var month=date.getMonth();
	var year=date.getFullYear();
	var date1 = new Date(year, month, day, 16,37, 30);
	var subscriptionPeriod ={ Daily: 'Daily', Weekly: 'Weekly', Monthly: 'Monthly'};
 	var job= schedule.scheduleJob(date1,function(){
 	let templateData= {
 		name: 'Test Data'
 	};
	for(var day in subscriptionPeriod){
		type= subscriptionPeriod[day];
		switch(type){
			case 'Daily': days= 1; break;
			case 'Weekly': days= 7; break;
			case 'Monthly': days= 30; break;
		}
		console.log("days is"+ days);
		console.log(type);
	
 		User.find({'subscription': type},function(err, user){
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
	}
 });
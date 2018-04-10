var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/naturenet");
mongoose.connect("mongodb://nature_niners:nature123@ds123929.mlab.com:23929/naturenet");
var eventSchema= new mongoose.Schema({
	rsvp: Boolean
	
});

var Event= mongoose.model("Event",eventSchema);
module.exports= Event;

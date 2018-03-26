var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/naturenet");
mongoose.connect("mongodb://nature_niners:nature123@ds123929.mlab.com:23929/naturenet");
var actionSchema= new mongoose.Schema({
	title: String,
	topic: String,
	pubDate: {type:Date, default: Date.now}	,
	content: String
});

var Action= mongoose.model("Action",actionSchema);
module.exports= Action;

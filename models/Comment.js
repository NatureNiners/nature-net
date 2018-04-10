var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/naturenet");
mongoose.connect("mongodb://nature_niners:nature123@ds123929.mlab.com:23929/naturenet");
var commentSchema= new mongoose.Schema({
	name: String,
	text: String,
	like: Boolean,
	commentDate: {type:Date, default: Date.now}
});

var Comment= mongoose.model("Comment",commentSchema);
module.exports= Comment;

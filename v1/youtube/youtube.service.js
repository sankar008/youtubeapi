var mongoose = require("mongoose");

var YoutubeSchema = new mongoose.Schema({
	userId: {type: String, required: [true, "User id is a required field"]},
	title: {type: String, required: [true, "Title is a required field"]},
	link: {type: String, required: [true, 'Link is a required field']},
	image: { type: String },
}, {timestamps: true});

module.exports = mongoose.model("youtube", YoutubeSchema);
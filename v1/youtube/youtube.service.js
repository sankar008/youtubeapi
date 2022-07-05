var mongoose = require("mongoose");

var YoutubeSchema = new mongoose.Schema({
	userId: {type: String},
	link: {type: String},
	image: { type: String },
}, {timestamps: true});

module.exports = mongoose.model("youtube", YoutubeSchema);
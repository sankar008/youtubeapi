  
var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	firstName: {type: String},
	lastName: {type: String},
	userCode: {type: String, required:true},
	email: {type: String, lowercase: true, required: [true, "Email id is a required filed"]},
	image: { type: String },
	password: { type: String },
	verified: { type: String, enum : ['1','0'], default: '0' },
	otp: { type: Number }

}, {timestamps: true});

UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

module.exports = mongoose.model("User", UserSchema);

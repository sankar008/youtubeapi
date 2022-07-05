  
var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	firstName: {type: String, required: [true, "First name must be required."]},
	lastName: {type: String, required: [true, "Last name must be required."]},
	userCode: {type: String, required: [true, "User code must be required."]},
	email: {type: String, lowercase: true, required: [true, "Email id is a required filed"]},
	image: { type: String },
	password: { type: String, required: [true, "Password must be require field"]},
	verified: { type: String, enum : ['1','0'], default: '0' },
	otp: { type: Number }

}, {timestamps: true});

UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

module.exports = mongoose.model("User", UserSchema);

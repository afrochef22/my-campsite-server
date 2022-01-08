const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

// We do not see username and password
// We use passportLocalMongoose to specify these for us.
const userSchema = new Schema({
	firstname: {
		type: String,
		default: "",
	},
	lastname: {
		type: String,
		default: "",
	},
	admin: {
		type: Boolean,
		default: false,
	},
	isLoggedIn: {
		type: Boolean,
		default: false,
	},
	facebookId: String,
});

userSchema.plugin(passportLocalMongoose); // Encrypts the password

module.exports = mongoose.model("User", userSchema);

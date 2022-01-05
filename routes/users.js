// Middlewares
const express = require("express");
const router = express.Router();

// Javascript files to import
const User = require("../models/user");
const passport = require("passport");
const authenticate = require("../authenticate");

/* GET users listing. */
// First arg == Endpoint
// 2nd & 3rd arg == Middleware (where req.user comes frome)
// 4th arg == Callback function
router.get(
	"/",
	authenticate.verifyUser,
	authenticate.verifyAdmin,
	function (req, res, next) {
		// Finds all our Users in our database.
		// Mongoose middleware returns a Promise everytime. .then .catch
		User.find()
			.then((users) => {
				// If it finds any Users do lines 23 - 26
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/jason");
				res.json(users);
			})
			.catch((err) => next(err)); //else we go to line 27, which goes to our error handler in app.js
	}
);

// 1st arg == Endpoint
// 2nd arg == Callbacuk function
router.post("/signup", (req, res) => {
	// Uses Passport strategy to register our User.
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(err, user) => {
			if (err) {
				res.statusCode = 501;
				res.setHeader("Content-type", "application/json");
				res.json({ err: err });
			} else {
				if (req.body.firstname) {
					user.firstname = req.body.firstname;
				}
				if (req.body.lastname) {
					user.lastname = req.body.lastname;
				}
				// When modifying a document that has default values. Remember in your Schema, firstname and lastname
				// have default values and since I am changing it when the User gives data to these values then
				// we need to call .save() method from Mongoose. Without this method it will not modify these values in your DB.
				user.save((err) => {
					if (err) {
						res.statusCode = 500;
						res.setHeader("Content-Type", "application/json");
						res.json({ err: err });
						return;
					}
					// Verfies the username and password after registering
					// checking to see if the username is not in our database.
					passport.authenticate("local")(req, res, () => {
						res.statusCode = 200;
						res.setHeader("Content-type", "application/json");
						res.json({ success: true, status: "Registration Successful!" });
					});
				});
			}
		}
	);
});

// 1st arg == endpoint
// 2nd arg == Middleware to do what?
// To authenticate the username and password of the User
router.post("/login", passport.authenticate("local"), (req, res) => {
	const token = authenticate.getToken({ _id: req.user._id });
	User.findByIdAndUpdate(
		req.user._id,
		{ $set: { isLoggedIn: true } },
		{ runValidators: true },
		(err) => {
			console.log(err);
		}
	);
	res.statusCode = 200;
	res.setHeader("Content-type", "application/json");
	res.json({
		success: true,
		token: token,
		status: "You are successfully logged in!",
	});
});

router.post("/logout", authenticate.verifyUser, (req, res, next) => {
	User.findByIdAndUpdate(
		req.user._id,
		{ $set: { isLoggedIn: false } },
		{ runValidators: true },
		(err) => {
			console.log(err);
		}
	);
	res.redirect("/");
});

module.exports = router;

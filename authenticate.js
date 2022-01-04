// Importing middlewares
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy; // jwt constructor
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

// Current working directory to import schema from users.
const User = require("./models/user");
const config = require("./config.js");

// Strategy for authenticating a user and their password
// http://www.passportjs.org/docs/username-password/
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// Takes a arguement of a callback function, which will just check to see if
// the strategies are implemented correctly.
// Note: your login route will not work without these 2 lines of code.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Takes a User JSON as an arguement and we will create a JWT token.
exports.getToken = (user) => {
	return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {}; // Variable that has a value (JSON). Holds key-value pair. Data structure to hold data

// Extracting JWT from POST request
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// Using passport to create a new Strategy.
// The parses information from the req.message and loads it in our req.message
exports.jwtPassport = passport.use(
	new JwtStrategy(opts, (jwt_payload, done) => {
		console.log("JWT payload", jwt_payload);
		User.findOne({ _id: jwt_payload._id }, (err, user) => {
			if (err) {
				return done(err, false);
			} else if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		});
	})
);

// Using Passport middleware to verify User (username and password)
// req.user comes from this middleware.
// Note: You will not have access to "req.user" without this middleware.
exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
	if (req.user.admin) {
		return next();
	} else {
		const err = new Error("You are not authorized to perform this operation!");
		res.statusCode = 403;
		return next(err);
	}
};

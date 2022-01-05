// Middlewares and core modules
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");

// Importing relevant files we need
// './' == current working directory
const config = require("./config");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");

// Databasee configuration
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
	// Optional, to get rid of errors when starting your application
	// Why? Because some of these methods have been deprecated.
	useCreateIndex: true,
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

connect.then(
	() => console.log("Connected correctly to server"),
	(err) => console.log(err)
);

// Using express middleware
var app = express();

// redirect any traffic going to the unsecure port to the secure port.
// This will catch any request to the server
app.all("*", (req, res, next) => {
	if (req.secure) {
		return next();
	} else {
		console.log(
			`Redirecting to: https://${req.hostname}:${app.get("secPort")}${req.url}`
		);
		res.redirect(
			301,
			`https://${req.hostname}:${app.get("secPort")}${req.url}`
		);
	}
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize()); // Express to use Passport middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conntecting to our Routers
// 1st arguement is usually what we call the starting point and with every strting point
// you need an endpoint.
// 2nd arguement is going to be a javascript file we imported.
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;

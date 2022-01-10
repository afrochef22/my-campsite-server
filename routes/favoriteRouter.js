const express = require("express");
const Favorite = require("../models/favorite");
const Campsite = require("../models/campsite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

	.get(
		cors.cors,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			Favorite.find({ user: req.user._id })
				.populate("user")
				.populate("campsites")
				.then((favorites) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(favorites);
				})
				.catch((err) => next(err));
		}
	)

	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			Favorite.findOne({ user: req.user._id })
				.then((favorite) => {
					if (favorite) {
						req.body.forEach((myFav) => {
							if (!favorite.campsites.includes(myFav._id)) {
								favorite.campsites.push(myFav._id);
							}
						});
						favorite
							.save()
							.then((favorite) => {
								res.statusCode = 200;
								res.setHeader("Content-Type", "application/jason");
								res.json(favorite);
							})
							.catch((err) => next(err));
					} else {
						Favorite.create({ user: req.user._id })
							.then((favorite) => {
								req.body.forEach((myFav) => {
									if (!favorite.campsites.includes(myFav._id)) {
										favorite.campsites.push(myFav._id);
									}
								});
								favorite
									.save()
									.then((favorite) => {
										res.statusCode = 200;
										res.setHeader("Content-Type", "application/jason");
										res.json(favorite);
									})
									.catch((err) => next(err));
							})
							.catch((err) => next(err));
					}
				})
				.catch((err) => next(err));
		}
	)

	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			res.statusCode = 403;
			res.end(`PUT operation not supported on /favorites/`);
		}
	)

	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			Favorite.findOneAndDelete({ user: req.user._id }).then((favorite) => {
				if (favorite) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(favorite);
				} else {
					res.statusCode = 200;
					res.setHeader("Content-Type", "text/plain");
					res.end("You do not have any favorites to delete.");
				}
			});
		}
	);

favoriteRouter
	.route("/:campsiteId")
	.options(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res) => res.sendStatus(200)
	)

	.get(
		cors.cors,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			res.statusCode = 403;
			res.end(
				`GET operation not supported on /favorites/${req.params.campsiteId}`
			);
		}
	)

	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			Campsite.findOne({ _id: req.params.campsiteId })
				.then((camp) => {
					console.log(camp);
					if (camp) {
						Favorite.findOne({ user: req.user._id })
							.then((favorite) => {
								console.log(favorite);

								if (favorite) {
									if (!favorite.campsites.includes(req.params.campsiteId)) {
										favorite.campsites.push(req.params.campsiteId);
									} else {
										res.statusCode = 200;
										res.setHeader("Content-Type", "text/plain");
										res.end(
											"That campsite is already in the list of favorites!"
										);
									}

									favorite
										.save()
										.then((favorite) => {
											res.statusCode = 200;
											res.setHeader("Contente-Type", "application/json");
											res.json(favorite);
										})
										.catch((err) => next(err));
								} else {
									Favorite.create({ user: req.user._id })
										.then((favorite) => {
											if (!favorite.campsites.includes(req.params.campsiteId)) {
												favorite.campsites.push(req.params.campsiteId);
											}

											favorite
												.save()
												.then((favorite) => {
													res.statusCode = 200;
													res.setHeader("Content-Type", "application/jason");
													res.json(favorite);
												})
												.catch((err) => next(err));
										})
										.catch((err) => next(err));
								}
							})
							.catch((err) => next(err));
					} else {
						res.statusCode = 200;
						res.setHeader("Content-Type", "text/plain");
						res.end("That campsite does not exsits!");
					}
				})
				.catch((err) => next(err));
		}
	)

	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyLoggedIn,
		(req, res, next) => {
			res.statusCode = 403;
			res.end(
				`PUT operation not supported on /favorites/${req.params.campsiteId}`
			);
		}
	)

	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({ user: req.user._id }).then((favorite) => {
			if (favorite) {
				favorite.campsites = favorite.campsites.filter(
					(myFav) => myFav.toString() !== req.params.campsiteId
				);
				favorite
					.save()
					.then((favorites) => {
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						res.json(favorites);
					})
					.catch((err) => next(err));
			} else {
				res.statusCode = 200;
				res.setHeader("Content-Type", "text/plain");
				res.end("You do not have any favorites to delete.");
			}
		});
	});

module.exports = favoriteRouter;

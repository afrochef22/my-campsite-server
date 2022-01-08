const secret = require("./secret");

module.exports = {
	secretKey: "12345-67890-09876-54321",
	mongoUrl: "mongodb://localhost:27017/nucampsite",
	facebook: {
		clientId: "908336683161794",
		clientSecret: secret,
	},
};

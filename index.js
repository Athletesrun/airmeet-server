const express = require("express"),

	app = express(),
	bodyParser = require("body-parser"),

	port = process.env.PORT || 8080,
	environment = process.env.NODE_ENV || "development",

	server = app.listen(port, () => {
		console.log("Environment: " + environment);
		console.log(new Date() + "\nListening on port " + port);
	});

const io = require("./sockets/sockets.js").listen(server);
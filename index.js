"use strict";

//@todo use npmi to programatically install bcrypt or bcryptjs

const express = require("express"),

	app = express(),
	bodyParser = require("body-parser"),

	port = process.env.PORT || 8080,
	environment = process.env.NODE_ENV || "development",

	knex = require("knex")({
		client: "pg",
		connection: "postgres://crjayodn:bCjl-9vY7T1vOyGsm99jSsX8gwVzyVIj@babar.elephantsql.com:5432/crjayodn"
	}),

	server = app.listen(port, () => {
		console.log("Environment: " + environment);
		console.log(new Date() + "\nListening on port " + port);
	});

app.use(bodyParser.json());
app.use(require("./routes/routes.js")(knex));

const io = require("./sockets/sockets.js").listen(server);

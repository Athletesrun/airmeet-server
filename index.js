"use strict";

const express = require("express"),

	app = express(),
	bodyParser = require("body-parser"),

	port = process.env.PORT || 8080,
	environment = process.env.NODE_ENV || "development",

	pg = require('pg'),

	server = app.listen(port, () => {
		console.log("Environment: " + environment);
		console.log(new Date() + "\nListening on port " + port);
	});

pg.defaults.ssl = true;

let knex;

if(process.env.NODE_ENV === "production") {
	knex = require("knex")({
		client: "pg",
		connection: "postgres://nlghwvfayvoifk:af3da8521ddd4a222cf85f36c84f68af569e169387479ed40fff6dd15dd82d91@ec2-107-20-163-238.compute-1.amazonaws.com:5432/dfic3203som2bm"
	});
} else {
	knex = require("knex")({
		client: "pg",
		connection: "postgres://crjayodn:bCjl-9vY7T1vOyGsm99jSsX8gwVzyVIj@babar.elephantsql.com:5432/crjayodn"
	});
}

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(require("./routes/routes.js")(knex));

const io = require("./sockets/sockets.js").listen(server);

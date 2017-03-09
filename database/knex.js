let knex = require('knex');

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

module.exports = knex;

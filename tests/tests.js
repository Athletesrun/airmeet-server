/*
 * This test is used to verify that the server is responding to all requests properly.
 *
 * ES6 arrow functions aren"t used here because mocha doesn"t like them
 *
 * To use, run `mocha` or `npm test` from the project"s root directory
 * Mocha must be installed either way.
 */

"use strict";

const request = require("request"),
	expect = require("chai").expect,
	assert = require("chai").assert,
	url = "http://localhost:8080";

let user = { //This user is used in the tests when creating an account, logging in, and accessing/creating data
		email: Math.round(Math.random() * 10000).toString() + "@gmail.com",
		password: "password",
		firstName: "Ben",
		lastName: "Wingerter"
	},
	authToken;

describe("Application features: ", function() {

	describe("Create and Login", function() {

		it("Create account", function(done) {

			const options = {
				url: url + "/api/accounts/register",
				method: "POST",
				json: user
			};

			request(options, function(error, resonse, body) {

				expect(body.status).to.equal("success");
				expect(body.token).to.be.a("string");

				authToken = body.token;

				done();

			});

		});

		it("Login", function (done) {

			setTimeout(() => {

				const options = {
					url: url + "/api/accounts/login",
					method: "POST",
					json: {
						email: user.email,
						password: user.password
					}
				};

				request(options, function (error, resonse, body) {

					expect(body.status).to.equal("success");
					expect(body.token).to.be.a("string");

					done();

				});

			}, 1000);
		});

	});

	describe("API functionality", function() {

		it("getUserProfile", function (done) {

			const options = {
				url: url + "/api/getUserProfile",
				method: "POST",
				json: {
					userId: 10,
					token: authToken
				}
			};

			request(options, function (error, resonse, body) {

				expect(body.firstName).to.equal("Jim");
				expect(body.lastName).to.equal("Collison");
				expect(body.email).to.equal("jim@ben.com");
				expect(body.id).to.equal(10);
				done();

			});
		});

	});
});

/*
 * This test is used to verify that the server is responding to all requests properly.
 *
 * ES6 arrow functions aren't used here because mocha doesn't like them
 *
 * To use, run `mocha` or `npm test` from the project's root directory
 * Mocha must be installed either way.
 */

"use strict";

const request = require('request'),
	expect = require('chai').expect,
	assert = require('chai').assert,
	io = require('socket.io-client'),
	url = 'http://localhost:8081',
	socket = io.connect(url),
	options = {
		transports: ['websockets'],
		'force new connection': true
	};

let authenticated,
	user = { //This user is used in the tests when creating an account, logging in, and accessing/creating data
		email: Math.round(Math.random() * 10000).toString() + '@gmail.com',
		password: 'password',
		name: 'Ben Wingerter',
		quotes: []
	};

describe('Application features: ', function() {

	describe('Create and Login', function() {

		it('Create account', function(done) {

			const options = {
				url: url + '/api/accounts/create',
				method: 'POST',
				json: user
			};

			request(options, function(error, resonse, body) {
				expect(body.status).to.equal('success');
				done();
			});

		});

		it('Login', function (done) {

			const options = {
				url: url + '/api/accounts/login',
				method: 'POST',
				json: {
					email: user.email,
					password: user.password
				}
			};

			request(options, function (error, resonse, body) {
				user.token = body.token;
				expect(body.status).to.equal('success');
				done();
			});
		});

	});

	describe('Websockets', function() {

		it('Handshake', function (done) {

			//Set timeout to give earlier tests a chance to set user.token. Mocha is asyncronous so tests don't run in order
			this.timeout(10000);

			setTimeout(function () {

				//socket = io.connect(url);
				authenticated = io.connect(url + '/authenticated');

				authenticated.on('connect', function () {
					authenticated.on('authenticated', function () {
						done();
					});

					authenticated.on('error', function (error) {
						throw new Error('Socket handshake error');
					});

					authenticated.on('unauthorized', function (error) {
						throw new Error('Socket handshake error');
					});

					authenticated.emit('authenticate', {token: user.token});
				});
			}, 2000);
		});
	});
});

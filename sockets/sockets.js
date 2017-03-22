"use strict";

const socketio = require("socket.io"),
	socketioJwt = require("socketio-jwt"),
	config = require("../config/config.js");

module.exports.listen = function(server) {

	let io = socketio.listen(server);

	io.use(socketioJwt.authorize({
		secret: config.publicKey,
		handshake: true
	}));

	io.on("connection", (socket) => {

		socket.on("connected", (socket) => {

			console.log("Socket connected with jwt " + socket.handshake.decoded_token.userId);
		});

	});

	return io;

};

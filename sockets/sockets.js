"use strict";

const socketio = require("socket.io"),
	socketioJwt = require("socketio-jwt");

module.exports.listen = function(server) {

	let io = socketio.listen(server);

	io.on("connection", (socket) => {

		socket.on("connected", (socket) => {
			console.log("socket connected");
		});

	});

	return io;

};

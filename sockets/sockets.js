"use strict";

const socketio = require("socket.io"),
	socketioJwt = require("socketio-jwt");

//@todo configure checking jwt

// NOTE sockets are only going to be used for the map!!!! HTTP for everything else

module.exports.listen = function(server) {

	let io = socketio.listen(server);

	io.on("connection", (socket) => {

		socket.on("connected", (socket) => {
			console.log("socket connected");
		});

	});

	return io;

};

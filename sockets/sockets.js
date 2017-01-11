const socketio = require("socket.io");

module.exports.listen = function(server) {

	let io = socketio.listen(server);

	return io;

}
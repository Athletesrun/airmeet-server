"use strict";

const router = require("express").Router(),
	check = require('check-types'),
	knex = require("../database/knex.js"),
	algorithms = require("algorithms"),
	config = require("../config/config.js"),

	authMiddleware = require("../middleware/auth.middleware.js"),
	eventMiddleware = require("../middleware/event.middleware");

function sortMessagesByDate(messages) {
	//Sort dates by using .valueOf(); It converts date to milliseconds from 1970.
	//It's easy for sorting dates because the newer one is a bigger number

	let dates = [];

	//Convert all dates .valueOf() and push to dates[]
	for(let i in messages) {
		dates.push(messages[i].date.valueOf());
	}

	//Sort dates and reverse it to biggest-to-smallest(newest to oldest)
	messages = algorithms.Sorting.quicksort(messages);
	messages.reverse();

	let sortedMessages = [];

	//Match dates in quotes with sorted states and push everything to an array
	for(let y in messages) {
		for(let x in messages) {
			if(dates[y] == messages[x].date.valueOf()) {
				dates[y] = null;
				sortedMessages[y] = messages[x];
			}
		}
	}

	for(let j in dates) {
		dates[j] = new Date(dates[j]);
	}

	return sortedMessages;
}

router.post("/api/sendMessage", [authMiddleware, eventMiddleware], (req, res) => {

	if(check.integer(req.body.receiver) && check.string(req.body.message)) {

		knex.select("*").from("users").where("id", "=", req.body.receiver).then((rows) => {

			if(rows[0]) {

				let messageToSend = {
					date: new Date(),
					message: req.body.message,
					sender: res.locals.userId,
					receiver: req.body.receiver,
					event: res.locals.event
				};

				knex.insert(messageToSend).returning("id").into("messages").then((userId) => {

					res.send({
						status: "success"
					});

				});

			} else {

				res.send({
					status: "error",
					message: "User not found"
				});

			}

		});

	} else {
		res.send({
			status: "error",
			message: config.parametersMessage
		});
	}

});

router.post("/api/getMessages", [authMiddleware, eventMiddleware], (req, res) => { //@todo split up. make this only return conversations and last message and get conversations separately

	knex.select("*").from("messages").where("sender", "=", res.locals.userId).orWhere("receiver", "=", res.locals.userId).then((rows) => {

		let returnableObject = {};

		for(let i in rows) {

			//convert user id's to string in order to use them as object properties
			rows[i].sender = rows[i].sender.toString();
			rows[i].receiver = rows[i].receiver.toString();

			//differentiate sending and receiving
			if(rows[i].sender === res.locals.userId.toString()) {

				//see if array in returnableObject already exists
				if(returnableObject[rows[i].receiver]) {

					//push to returnableObject
					returnableObject[rows[i].receiver].push(rows[i]);

				} else {

					//create array in returnable object and push to it
					returnableObject[rows[i].receiver] = [];
					returnableObject[rows[i].receiver].push(rows[i]);

				}

			} else if(rows[i].receiver === res.locals.userId.toString()){

				//You won't be the star(name) of the conversation because you(senders) are never stars
				//so simply add

				//check to see if sender is already array of returnable object
				if(returnableObject[rows[i].sender]) {

					returnableObject[rows[i].sender].push(rows[i]);

				} else {

					returnableObject[rows[i].sender] = [];
					returnableObject[rows[i].sender].push(rows[i]);

				}
			}

		}

		//@todo oh god i need to sort these messages by date

		let messageKeys = Object.keys(returnableObject);
		let messageKeysInOrder = [];

		/*for(let x in messageKeys) {

		 returnableObject[messageKeys[x]] = sortMessagesByDate(returnableObject[messageKeys[x]]);
		 //messageKeysInOrder.push()

		 }*/

		/*algorithms.Sorting.quicksort(messageKeysInOrder);

		 console.log(returnableObject);*/


		res.send(returnableObject);

	});

});

module.exports = router;
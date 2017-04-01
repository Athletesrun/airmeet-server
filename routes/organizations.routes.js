"use strict";

const router = require("express").Router(),

    check = require("check-types"),

    knex = require("../database/knex.js"),

    config = require("../config/config.js"),

	authMiddleware = require("../middleware/auth.middleware.js"),
	eventMiddleware = require("../middleware/event.middleware");

router.post("getAllOrganizations", [authMiddleware, eventMiddleware], (req, res) => {

    knex.select('*').from("organizations").where("event", "=", res.locals.eventId).then((rows) => {

        res.send(rows);

    });

});

module.exports = router;

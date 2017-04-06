"use strict";

const router = require("express").Router(),

    check = require("check-types"),

    knex = require("../database/knex.js"),

    config = require("../config/config.js"),

	authMiddleware = require("../middleware/auth.middleware.js"),
	eventMiddleware = require("../middleware/event.middleware");

router.post("/api/getAllOrganizations", [authMiddleware, eventMiddleware], (req, res) => {

    knex.select("name", "id", "lat", "lng", "picture").from("organizations").where("event", "=", res.locals.event).then((rows) => {

        res.send(rows);

    });

});

router.post("/api/getOrganization", [authMiddleware, eventMiddleware], (req, res) => {

    if(check.integer(req.body.organizationId)) {
        knex.select("*").from("organizations").where("id", "=", req.body.organizationId).then((rows) => {

            if(rows.length === 0) {

                res.send({
                    status: 'error',
                    message: 'organization does not exist'
                });

            } else {

                res.send(rows[0]);

            }

        });
    } else {

        res.send({
            status: 'error',
            message: config.parametersMessage
        });

    }

});

module.exports = router;

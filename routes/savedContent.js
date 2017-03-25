"use strict";

const router = require("express").Router(),
    knex = require("../database/knex.js"),
    config = require("../config/config.js"),
	check = require("check-types"),

	authMiddleware = require("../middleware/auth.middleware.js"),
	eventMiddleware = require("../middleware/event.middleware");

router.post("/api/getSavedProfiles", authMiddleware, (req, res) => {

    knex.select("savedProfiles").from("users").where("id", "=", res.locals.userId).then((rows) => {

        let profiles = rows[0].savedProfiles.savedProfiles;

        const profilesToComplete = profiles.length;

        let fullProfiles = [];

        let profilesCompleted = 0;

        function complete () {

            profilesCompleted++;

            if(profilesCompleted === profilesToComplete) {
                res.send(fullProfiles);
            }

        }

        if(profiles.length === 0) {

            res.send([]);

        } else {

            for(let i in profiles) {

                knex.select("*").from("users").where("id", "=", profiles[i]).then((rows) => {

                    fullProfiles.push(rows[0]);

                    complete();

                });

            }

        }

    });

});

router.post("/api/getSavedConversations", authMiddleware, (req, res) => {

});

router.post("/api/saveProfile", authMiddleware, () => {

});

router.post("/api/saveConversation", authMiddleware, () => {

});

module.exports = router;

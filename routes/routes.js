"use strict";

const router = require("express").Router(),

    fs = require("fs"),

    npmi = require("npmi"),

    jwt = require("jsonwebtoken"),
    privateKey = fs.readFileSync("./keys/jwt.private.key"),
    publicKey = fs.readFileSync("./keys/jwt.public.key"),

    saltRounds = 12,

    check = require("check-types"),

    parametersMessage = "Missing required parameters",
    unauthorizedMessage = "Incorrect email and/or password",

	testEventCode = "ben";

let bcrypt = require('bcryptjs');

/*if(process.platform === "win32") {

    const options = {
        name: "bcryptjs",
        path: ".",
        forceInstall: false
    }

    npmi(options, (err, result) => {

        if(err) {
            console.log("Error: ");
            console.log(err);
        } else {
            console.log("bcryptjs installed");
        }

    });

} else {

    const options = {
        name: "bcrypt",
        path: ".",
        forceInstall: false
    }

    npmi(options, (err, result) => {
        if(err) {
            console.log("Error: ");
            console.log(err);
        } else {
            console.log("bcrypt installed");
        }
    });

}*/

function generateToken(userId, callback) {

    jwt.sign({userId: userId}, privateKey, { algorithm: 'RS256' }, (err, token) => {

        if(err) {
            console.log("Error: " + err);
        } else {
            callback(token);
        }

    });

}



module.exports = (knex) => {


	//@TODO verify that the user if a member of the event
	function authMiddleware(req, res, next) {
		if(check.string(req.body.token)) {

			jwt.verify(req.body.token, publicKey, (err, decoded) => {
				if(err) {

					console.log("JWT Verify error: " + err);
					res.sendStatus(500);

				} else {

					res.locals.userId = decoded.userId; //res.locals used to pass data along request. Allow API methods access to userId

					next();

				}
			});

		} else {
			res.send({
				status: "error",
				message: parametersMessage
			})
		}
	}

	function eventMiddleware(req, res, next) {

		knex.select("event").from("users").where("id", "=", res.locals.userId).then((rows) => {

			if(check.array(rows) && check.nonEmptyString(rows[0].event)) {
				res.locals.event = rows[0].event;

				console.log(res.locals.event);

				next();

			} else {

				res.send({
					status: "error",
					message: "Not registered in any events"
				});

			}

		});
	}

    router.get("/", (req, res) => {
        res.send("Hello world!");
    });

    router.post("/api/accounts/login", (req, res) => {
        if(check.string(req.body.email) && check.string(req.body.password)) {
            knex.select("email", "password", "password", "id").from("users").where("email", "=", req.body.email).then((rows) => {

                if(check.nonEmptyArray(rows)) {
                    bcrypt.compare(req.body.password, rows[0].password, (err, hashResponse) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.sendStatus(503);
                        }

                        if(hashResponse === true) {

                            generateToken(rows[0].id, (token) => {

                                res.send({
                                    status: "success",
                                    token: token
                                });
                            })

                        } else {

                            res.send({
                                status: "error",
                                message: unauthorizedMessage
                            });

                        }

                    });
                } else {
                    res.send({
                        status: "error",
                        message: unauthorizedMessage
                    });
                }
            });
        } else {
            req.send({
                status: "error",
                message: parametersMessage
            });
        }
    });

    router.post("/api/accounts/register", (req, res) => {

        if(check.string(req.body.email) && check.string(req.body.password) && check.string(req.body.firstName) && check.string(req.body.lastName)) {

            knex.select("email").from("users").where("email", "=", req.body.email).then((rows) => {

                if(check.emptyArray(rows)) {

                    bcrypt.hash(req.body.password, saltRounds, (err, hashedPassword) => {

                        if(err) {
                            console.log("Error: " + err);
                            res.send(403);
                        } else {

                            knex.insert({
                                email: req.body.email,
                                password: hashedPassword,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName
                            }).returning("id").into("users").then((userId) => {

	                            generateToken(userId[0], (token) => {
		                            res.send({
			                            status: "success",
			                            token: token
		                            });
	                            });

                            });

                        }

                    });

                } else {
                    res.send({
                        status: "error",
                        message: "User Already Exists"
                    })
                }

            });

        } else {
            res.send({
                status: "error",
                message: parametersMessage
            })
        }

    });

    router.post("/api/getUserProfile", [authMiddleware, eventMiddleware], (req, res) => {

	    if(check.number(req.body.userId)) {

	        knex.select("*").from("users").where("id", "=", req.body.userId).then((rows) => {

	            if(check.emptyArray(rows)) {

	                res.send({
	                    count: 0
				    });

			    } else {

	                res.send(rows[0]);

			    }

		    });
	        
	    } else {
	    	res.send({
	    		status: "error",
			    message: parametersMessage
		    });
	    }

    });

    router.post("/api/getOwnProfile", [authMiddleware, eventMiddleware], (req, res) => {

    	knex.select("*").from("users").where("id", "=", res.locals.userId).then((rows) => {

			res.send(rows[0]);

	    })

    });

    router.post("/api/getAllProfiles", [authMiddleware, eventMiddleware], (req, res) => {

	        knex.select("*").from("users").then((rows) => {

	            res.send(rows);

		    });

    });

    router.post("/api/updateProfile", [authMiddleware, eventMiddleware], (req, res) => {
        res.send("hello world");
    });

    router.post("/api/sendMessage", [authMiddleware, eventMiddleware], (req, res) => {
        res.send("hello world");
    });

    router.post("/api/getMessages", [authMiddleware, eventMiddleware], (req, res) => {
        res.send("hello world");
    });

    router.post("/api/searchUsers", [authMiddleware, eventMiddleware], (req, res) => {

        if(check.string(req.body.name)) {
        
            //@todo implement searching for things other than name

            knex.raw("SELECT * FROM users q WHERE to_tsvector('english', text || ' ' || name) @@ to_tsquery('english', '" + query + "' )").then((response) => {
                console.log(response);
            })
        
        } else {
            res.send({
                status: "eror",
                message: parametersMessage
            });
        }
    });

    router.post("/api/joinEvent", [authMiddleware], (req, res) => {

    	if(check.string(req.body.event)) {

    		if(req.body.event === testEventCode) {

                console.log(res.locals.userId); 

			    knex("users").where("id", "=", res.locals.userId).update({
				    event: "testEvent"
			    });

			    res.send({
				    status: "success"
			    });

		    } else {

    			res.send({
    				status: "error",
				    message: "Invalid event code"
			    });

		    }

	    } else {
    		res.send({
    			status: "error",
			    message: parametersMessage
		    })
	    }

    });

    router.post("/api/getEventInfo", [authMiddleware, eventMiddleware], (req, res) => {

        //@todo return real event info

        res.send({
            name: "Ben's Event",
            date: new Date(),
            website: "https://www.google.com"
        });

    });
    
    router.post("/api/leaveEvent", [authMiddleware, eventMiddleware], (req, res) => {
        res.send("hello world");
    });

    return router;
};

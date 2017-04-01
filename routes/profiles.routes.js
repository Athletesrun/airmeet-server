"use strict";

const router = require("express").Router(),
    knex = require("../database/knex.js"),
    fs = require('fs'),
    s3 = require('s3'),
    _ = require("lodash"),
    config = require("../config/config.js"),
	check = require("check-types"),

    jwt = require("jsonwebtoken"),

    multer = require('multer'),
    upload = multer({dest: 'uploads/pictures'}),

	authMiddleware = require("../middleware/auth.middleware.js"),
	eventMiddleware = require("../middleware/event.middleware"),

    sendFileOptions = {
        root: __dirname + '/../public/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    },

    s3Client = s3.createClient({
        maxAsyncS3: 20,
        s3RetryCount: 3,
        s3RetryDelay: 1000,
        multipartUploadThreshold: 20971520, // (20 MB)
        multipartUploadSize: 15728640, // (15 MB)
        s3Options: {
        accessKeyId: "AKIAJHERTS2E5Z23PEOQ",
            secretAccessKey: "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",
        },
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
            message: config.parametersMessage
        });
    }

});

router.post("/api/getOwnProfile", [authMiddleware], (req, res) => {

    //I know, I know. This returns the password. Screw it. The password's encrypted pretty well and this app doesnt really mean anything
    knex.select("*").from("users").where("id", "=", res.locals.userId).then((rows) => {

        res.send(rows[0]);

    });

});

router.post("/api/getAllProfiles", [authMiddleware, eventMiddleware], (req, res) => {

    knex.select("*").from("users").where("event", "=", res.locals.event).then((rows) => {

        for(let i in rows) {

            if(rows[i].id === res.locals.userId) {

                rows.splice(i, 1);

            }
        }

        res.send(rows);

    });

});

router.post("/api/updateProfile", [authMiddleware], (req, res) => {

    let propertiesToUpdate = {};

    _.forEach(req.body, (value, key) => {
        if(key !== "token") {

            if(key === "firstName" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "lastName" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "description" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "interests" && check.array(value.interests)) {

                //@todo verify object with array of interests

                propertiesToUpdate[key] = {};
                propertiesToUpdate[key] = value;

            }

            if(key === "linkedin" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "facebook" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "twitter" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "email" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

            if(key === "phone" && check.string(value)) {
                propertiesToUpdate[key] = value;
            }

        }
    });

    if(Object.keys(propertiesToUpdate).length !== 0) {

        knex("users").where("id", "=", res.locals.userId).update(propertiesToUpdate).then((err) => {

            res.send({
                status: "success"
            });

        });
    } else {

        res.send({
            status: "success"
        });

    }

});

router.post("/api/updateProfilePicture/:token", upload.single('picture'), (req, res) => {

    console.log(req);

    jwt.verify(req.params.token, config.publicKey, (err, decoded) => {
        if(err) {
            console.log('JWT error');
            console.log(err);
            res.send(500);
        }

        res.locals.userId = decoded.userId;

        if(req.file) {
            if(req.file.mimetype === 'image/png' ||
                req.file.mimetype === 'image/jpeg' ||
                req.file.mimetype === 'image/pjpeg' ||
                req.file.mimetype === 'image/svg+xml' ||
                req.file.mimetype === 'image/gif') {

                if(req.file.size <= 15728640) {

                    let extension;

                    if(req.file.mimetype === 'image/png') {
                        extension = '.png';
                    } else if(req.file.mimetype === 'image/jpeg') {
                        extension = '.jpg';
                    } else if(req.file.mimetype === 'image/pjpeg') {
                        extension = '.jpg';
                    } else if(req.file.mimetype === 'image/svg+xml') {
                        extension = '.svg';
                    } else if(req.file.mimetype === 'image/gif') {
                        extension = '.gif';
                    }

                    knex("users").where("id", "=", res.locals.userId).update({picture: res.locals.userId + extension}).then((err) => {
                        let uploader = s3Client.uploadFile({
                            localFile: 'uploads/pictures/' + req.file.filename,

                            s3Params: {
                                Bucket: 'airmeet-uploads',
                                Key: 'pictures/' + res.locals.userId + extension,
                                ContentType: req.file.mimetype
                            }
                        });

                        uploader.on('error', (err) => {

                            console.log("Picture uploading error");
                            console.log(err.stack);

                            res.send({
                                status: 'error',
                                message: 'An error occured'
                            });
                        });

                        uploader.on('end', () => {
                            fs.unlink('uploads/pictures/' + req.file.filename, function(err) {

                                if(err) {
                                    console.log("Picture uploading error");
                                    console.log(err);
                                }

                                res.send({
                                    status: 'success'
                                });

                            });
                        });
                    });


                } else {

                    fs.unlink('uploads/pictures/' + req.file.filename);

                    res.send({
                        status: 'error',
                        message: 'Image too large'
                    });
                }

            } else {

                fs.unlink('uploads/pictures/' + req.file.filename);

                res.send({
                    status: 'error',
                    message: 'Invalid image format'
                });
            }
        } else {
            res.send({
                status: 'error',
                message: 'You forgot to send a file :P'
            });
        }
    });
});

router.post("/api/searchProfiles", [authMiddleware, eventMiddleware], (req, res) => {

	let expectedResponses = 3,
		results = [];

	function checkIfSearchIsComplete(searchResults) {

		for(let i in searchResults) {

            if(searchResults[i].id !== res.locals.userId) {

	           results.push(searchResults[i]);

           }

		}

		expectedResponses--;

		if(expectedResponses === 0) {
			res.send({
				status: "success",
				results: results
			});
		}

	}

	if(check.string(req.body.query)) {

		knex.raw("SELECT * FROM users q WHERE to_tsvector('english', \"firstName\" || ' ' || \"firstName\") @@ plainto_tsquery('english', '" + req.body.query + "' )").then((response) => {

			checkIfSearchIsComplete(response.rows);

		});

		knex.raw("SELECT * FROM users q WHERE to_tsvector('english', \"lastName\" || ' ' || \"lastName\") @@ plainto_tsquery('english', '" + req.body.query + "' )").then((response) => {

			checkIfSearchIsComplete(response.rows);

		});

		knex.raw("SELECT * FROM users q WHERE to_tsvector('english', description || ' ' || description) @@ plainto_tsquery('english', '" + req.body.query + "' )").then((response) => {

			checkIfSearchIsComplete(response.rows);

		});

		/*knex.raw("SELECT * FROM users q WHERE to_tsvector('english', interests || ' ' || interests) @@ plainto_tsquery('english', '" + req.body.query + "' )").then((response) => {

			checkIfSearchIsComplete(response.rows);

		});*/

	} else {
		res.send({
			status: "error",
			message: config.parametersMessage
		});
	}
});

module.exports = router;

"use strict";

const router = require("express").Router(),

    fs = require("fs"),

    jwt = require("jsonwebtoken"),
    privateKey = fs.readFileSync("./keys/jwt.private.key"),
    publicKey = fs.readFileSync("./keys/jwt.public.key"),

    bcrypt = require('bcrypt'),
    saltRounds = 12,

    check = require("check-types"),

    parametersMessage = "Missing required parameters",
    unauthorizedMessage = "Incorrect email and/or password";

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

                            knex("users").insert({
                                email: req.body.email,
                                password: hashedPassword,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName
                            }).then((newUser) => {

                                generateToken(newUser.id, (token) => {
                                    res.send({
                                        status: "success",
                                        token: token
                                    });
                                });

                            })

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

    router.post("/api/getUserProfile", (req, res) => {
       res.send("hello world");
    });

    router.post("/api/getOwnProfile", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/updateProfile", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/getMessagesBetweenUser", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/sendMessage", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/getMessages", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/searchUsers", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/joinEvent", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/getEventInfo", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/joinEvent", (req, res) => {
        res.send("hello world");
    });
    
    router.post("/api/leaveEvent", (req, res) => {
        res.send("hello world");
    });

    return router;
};

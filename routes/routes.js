"use strict";

const router = require("express").Router(),
    fs = require("fs"),
    jwt = require("jsonwebtoken"),
    privateKey = fs.readFileSync("./keys/jwt.private.key"),
    publicKey = fs.readFileSync("./keys/jwt.public.key");

module.exports = () => {

    router.get("/", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/accounts/login", (req, res) => {
        res.send("hello world");
    });

    router.post("/api/accounts/register", (req, res) => {
        res.send("hello world");
    });

    return router;
};

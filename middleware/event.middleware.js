const knex = require("../database/knex.js"),
    check = require("check-types");

module.exports = (req, res, next) => {

    knex.select("event").from("users").where("id", "=", res.locals.userId).then((rows) => {

        if(check.array(rows)) {

            if(check.integer(rows[0].event)) {
                res.locals.event = rows[0].event;

                next();
            } else {

                res.send({
                    status: "error",
                    message: "Not registered in any events"
                });

            }

        } else {

            res.send({
                status: "error",
                message: "Not registered in any events"
            });

        }

    });
};

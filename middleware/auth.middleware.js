const config = require("../config/config.js"),
    jwt = require("jsonwebtoken"),
    check = require("check-types");

module.exports = (req, res, next) => {
    if(check.string(req.body.token)) {

        jwt.verify(req.body.token, config.publicKey, (err, decoded) => {
            if(err) {

                res.send({
                    status: 'error',
                    message: 'Invalid token'
                });

            } else {

                res.locals.userId = decoded.userId; //res.locals used to pass data along request. Allow API methods access to userId

                next();

            }
        });

    } else {
        res.send({
            status: "error",
            message: config.parametersMessage
        });
    }
};

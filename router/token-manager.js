var redis = require('redis');
var config = require('config');
var secret = config.get('secretToken');
var jsonWebToken = require('jsonwebtoken');


// Middleware for token verification
var verifyToken = function (req, res, next) {
    'use strict'

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jsonWebToken.verify(token, secret, function (err, decoded) {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    //check if 'tokenKeepAlive' is true for the particular client id, renew the token and proceed.
                }
                console.log(err);
                return res.status(401).json({
                    //TODO: define proper straucture to handle data on client.
                    success: false,
                    message: err
                });
            } else {
                // if everything is good, save to request for use in other routes
                var updatedToken = newToken(decoded);
                req.decoded = decoded;
                res.setHeader('x-access-token', updatedToken);
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).json({
            //TODO: define proper straucture to handle data on client.
            success: false,
            message: 'No token provided.'
        });

    }
};

var newToken = function (payload) {
    return jsonWebToken.sign(payload, secret, {
        expiresIn: "24h" //expiresInMinutes: 1440 
    });
};

var getPayloadAnyway = function (token) {
    var decoded = jsonWebToken.decode(token, {
        complete: true
    });
    return decoded.payload;
}

module.exports = {
    newToken: newToken,
    verifyToken: verifyToken,
    getPayloadAnyway: getPayloadAnyway
};
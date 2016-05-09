module.exports = function (app) {

    'use strict'
    var express = require('express');
    var router = express.Router();

    var tokenManager = require('./token-manager');

    var authenticationRoute = require('./authentication');
    var searchRoute = require('./search');
    var userRoute = require('./user');

    router.use(function (req, res, next) {
        'use strict'
//        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
//        console.log(fullUrl);
//        console.log("TOKEN: " + req.headers['x-access-token']);
        //        console.log(req.body);
        next();
    });

    //Add authentication routes(no token check required).
    authenticationRoute(router);

    //Add search routes(no token check required).
    searchRoute(router);

    //Inject verify token method to router.
    router.use(tokenManager.verifyToken);

    //Add other authenticated routes after token check.
    userRoute(router);

    app.use('/api', router);

};
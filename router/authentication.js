module.exports = function (router) {
    'use strict'

    var userService = require('../dataService/user');

    var tokenManager = require('./token-manager');

    router.post('/authentication/login', function (req, res, next) {
        var userName = req.body.userName;
        var password = req.body.password;
        var machineName = req.body.machineName;
        var machineID = req.body.machineID;

        userService.validateAndSignUser(userName, password, machineID, machineName, function (err, data) {
            if (err) {
                next(err);
            } else {
                console.log(data);
                var user = {
                    displayName: data.user.displayName,
                    bloodGroup: data.user.bloodGroup
                }

                res.setHeader('x-access-token', data.token);
                res.status(200).json(user); //200 for OK

            }
        });
    });

    router.post('/authentication/refreshtoken', function (req, res, next) {
        var machineID = req.body.machineID;
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        userService.refreshToken(token, machineID, function (err, newToken) {
            if (err) {
                next(err);
            } else {
                //                console.log(data);
                var result = {
                    message: 'Done'
                }

                res.setHeader('x-access-token', newToken);
                res.status(200).json(result); //200 for OK

            }
        });
    });

    router.post('/authentication/signup', function (req, res, next) {
        var userName = req.body.userName;
        var password = req.body.password;
        var displayName = req.body.displayName;
        var bloodGroup = req.body.bloodGroup;

        userService.createUser(userName, password, displayName, bloodGroup, function (err, data) {
            if (err) {
                next(err);
            } else {

                res.status(201).json({ //201 fro created
                    result: "user signed up successfully."
                });
            }
        });
    });

    router.post('/authentication/userNameAvailable', function (req, res, next) {
        var userName = req.body.userName;

        userService.hasUser(userName, function (err, count) {
            if (err) {
                next(err);
            } else {

                res.status(200).json({
                    result: count
                });
            }

        });
    });



    router.post('/authentication/gcm', function (req, res, next) {
        var instanceToken = req.body.instanceToken;

        //        console.log(instanceToken);

        var gcm = require('node-gcm');

        var message = new gcm.Message();

        message.addData('message', 'Call from server.');

        var regTokens = [instanceToken];

        // Set up the sender with you API key 
        var sender = new gcm.Sender('AIzaSyDns1_NCa-Jb0VFQA3C-hfp6SD7Ap3sCNU');

        // Now the sender can be used to send messages 
        sender.send(message, {
            registrationTokens: regTokens
        }, function (err, response) {
            if (err) {
                //                console.error(err);
                res.status(500).json({
                    error: err
                });
            } else {
                //                console.log(response);
                res.status(200).json({
                    result: response

                });
            }
        });

        // Send to a topic, with no retry this time 
        //        sender.sendNoRetry(message, {
        //            topic: '/topics/global'
        //        }, function (err, response) {
        //            if (err) console.error(err);
        //            else console.log(response);
        //        });

    });

}
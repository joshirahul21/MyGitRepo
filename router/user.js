module.exports = function (router) {
    'use strict'

    var userService = require('../dataService/user');

    router.post('/user/changepassword', function (req, res, next) {
        res.send('TODO: Not implemented');
    });

    router.post('/user/logout', function (req, res, next) {
        var userName = req.decoded.userName;
        var machineID = req.decoded.machineID;
        userService.signout(userName, machineID, function (err, data) {
            if (err) {
                next(err);
            } else {
                userService.signout(userName, machineID, function (err, data) {
                    if (err) {
                        next(err);
                    } else {
                        //TODO: Remove token from here.
                        res.status(200).json({ // 200 for OK
                            result: 'logout success.'
                        });
                    }
                });
            }
        });
    });

    router.post('/user/setInstanceToken', function (req, res, next) {
        var userName = req.decoded.userName;
        var machineID = req.decoded.machineID;
        var instanceToken = req.body.instanceToken;
        userService.setInstanceToken(userName, machineID, instanceToken, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.status(200).json({
                    result: 'Added for PUSH.'
                });
            }
        });

    });

    router.post('/user/setlocation', function (req, res, next) {
        var userName = req.decoded.userName;
        var machineID = req.decoded.machineID;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        var bloodGroup = req.decoded.bloodGroup;
        userService.setLocation(userName, machineID, longitude, latitude, bloodGroup, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.status(200).json({
                    result: 'Location updated.'
                }); //200 for OK
            }
        });
    });

    router.post('/user/broadcastRequest', function (req, res, next) {
        var instanceTokens = req.body.instanceTokens;
        var message = req.body.message;

        //        console.log(instanceTokens);
        //        console.log(req.body);

        var regTokens = [];

        for (var i = 0; i < instanceTokens.length; i++) {
            var instanceToken = instanceTokens[i];
            if (instanceToken && instanceToken.instanceToken && instanceToken.instanceToken.clientToken) {
                regTokens.push(instanceToken.instanceToken.clientToken);
            }
        }

        //        console.log(regTokens);

        var gcm = require('node-gcm');

        var gcmMessage = new gcm.Message();

        gcmMessage.addData('message', message);

        // Set up the sender with you API key 
        var sender = new gcm.Sender('AIzaSyDns1_NCa-Jb0VFQA3C-hfp6SD7Ap3sCNU');

        // Now the sender can be used to send messages 
        sender.send(gcmMessage, {
            registrationTokens: regTokens
        }, function (err, response) {
            if (err) {
                //                console.error(err);
                res.status(500).json({
                    error: err
                });
            } else {

                //                res.setHeader('x-access-token', '');
                //                console.log(response);
                res.status(200).json({
                    result: response

                });
            }
        });
    });

    router.post('/user/sendmessage', function (req, res, next) {
        var toUserName = req.body.userName;
        var fromUserName = req.decoded.userName;
        var message = req.body.message;
        var messageType = req.body.messageType;

        userService.sendMessage(toUserName, fromUserName, message, messageType, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.status(200).json(result); //200 for OK
            }
        });
    });

};
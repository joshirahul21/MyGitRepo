var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var User = require('../models/User');
var UserDetail = require('../models/UserDetail');
var errorHelper = require('../error').errorHelper();
var tokenManager = require('../router/token-manager');

var createUser = function (userName, password, displayName, bloodGroup, callback) {
    'use strict'

    if (!callback && typeof callback != 'function') {
        return;
    }

    if (!userName) {
        callback(errorHelper.parameterError("userName"), null);
        return;
    }
    if (!password) {
        callback(errorHelper.parameterError("password"), null);
        return;
    }
    if (!displayName) {
        callback(errorHelper.parameterError("displayName"), null);
        return;
    }
    if (!bloodGroup) {
        callback(errorHelper.parameterError("bloodGroup"), null);
        return;
    }
    var query = User.findOne({
        'userName': userName
    });

    query.exec(function (error, user) {
        if (error) {
            callback(error, null);
            return;
        }
        if (user) {
            callback({
                'name': 'Duplicate value found',
                'message': '"userName:' + userName + '" already exist.'
            }, null);
            return;
        }

        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) {
                callback(saltError, null);
                return;
            }
            bcrypt.hash(password, salt, function () {}, function (hashError, hash) {
                if (hashError) {
                    callback(hashError, null);
                    return;
                }


                user = new User();
                user.userName = userName;
                user.passwordHash = hash;
                user.salt = salt;
                user.displayName = displayName;
                user.bloodGroup = bloodGroup;
                //                console.log(user);

                user.save(function (saveError, data, rowCount) {
                    if (saveError) {
                        //                        console.log(saveError);
                        callback(saveError, null);
                        return;

                    }
                    callback(null, data);
                });
            });
        });

    });
};

var validateAndSignUser = function (userName, password, machineID, machineName, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }
    if (!userName) {
        callback(errorHelper.parameterError("userName"), null);
        return;
    }
    if (!password) {
        callback(errorHelper.parameterError("password"), null);
        return;
    }
    if (!machineID) {
        callback(errorHelper.parameterError("machineID"), null);
        return;
    }
    if (!machineName) {
        callback(errorHelper.parameterError("machineName"), null);
        return;
    }

    var query = User.findOne({
        'userName': userName
    });

    query.exec(function (err, user) {
        if (err) {
            callback(err, null);
            return;
        }
        if (!user) {
            callback(errorHelper.unauthorizedError("userName is not found."), null);
            return;
        }
        bcrypt.hash(password, user.salt, function () {}, function (hashError, hash) {
            if (hashError) {
                callback(hashError, null);
                return;
            }
            if (user.passwordHash != hash) {
                callback(errorHelper.unauthorizedError('password is not correct.'), null);
                return;
            }

            //create token.
            var payload = {
                'userName': user.userName,
                'machineID': machineID,
                'machineName': machineName,
                'machineType': 'AA',
                'bloodGroup': user.bloodGroup
            };

            var token = tokenManager.newToken(payload);

            var userDetailQuery = UserDetail.findOne({
                'userName': userName,
                'machineID': machineID
            });

            userDetailQuery.exec(function (userDetailQueryError, userDetail) {
                if (userDetailQueryError) {
                    callback(userDetailQueryError, null);
                    return;
                }
                if (!userDetail) {
                    userDetail = new UserDetail();
                    userDetail.userName = userName;
                    userDetail.machineID = machineID;
                }
                userDetail.bloodGroup = user.bloodGroup;

                //                var loginToken = {
                //                    machineName: machineName,
                //                    token: token,
                //                    tokenKeepAlive: true,
                //                    dateUpdated: Date.now()
                //                };
                userDetail.machineName = machineName;

                userDetail.save(function (saveError, data) {
                    if (saveError) {
                        callback(saveError, null);
                        return;
                    }

                    data.displayName = user.displayName;
                    callback(null, {
                        'token': token,
                        'user': data
                    });

                });
            });
        });
    });
};

var refreshToken = function (token, machineID, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }
    if (!token) {
        callback(errorHelper.parameterError("token"), null);
        return;
    }
    if (!machineID) {
        callback(errorHelper.parameterError("machineID"), null);
        return;
    }

    var payload = tokenManager.getPayloadAnyway(token);
    if (payload.machineID === machineID) {
        var token = tokenManager.newToken(payload);
        callback(null, token);
    } else {
        callback(errorHelper.untrustedTokenError(), null);
    }
};

var hasUser = function (userName, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }

    if (!userName) {
        callback(errorHandler.parameterError('userName'), null);
        return;
    }

    var query = User.where({
        'userName': userName
    });

    query.count(function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }

        if (callback && typeof callback == 'function') {
            callback(null, result);
        }
    });
};

var signout = function (userName, machineID, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }
    if (!userName) {
        callback(errorHelper.parameterError('userName'), null);
        return;
    }
    if (!machineID) {
        callback(errorHelper.parameterError('machineID'), null);
        return;
    }

    UserDetail.remove({
        userName: userName,
        machineID: machineID
    }, function (err) {
        if (!err) {
            callback(err, null);
            return;
        } else {
            callback(null, userName);
            //TODO: Expire token here.
        }
    });
};

var setLocation = function (userName, machineID, longitude, latitude, bloodGroup, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }
    if (!userName) {
        callback(errorHelper.parameterError('userName'), null);
        return;
    }
    if (!machineID) {
        callback(errorHelper.parameterError('machineID'), null);
        return;
    }
    if (!longitude) {
        callback(errorHelper.parameterError('longitude'), null);
        return;
    }
    if (!latitude) {
        callback(errorHelper.parameterError('latitude'), null);
        return;
    }
    if (!bloodGroup) {
        callback(errorHelper.parameterError('bloodGroup'), null);
        return;
    }

    var coords = [];
    coords[0] = longitude;
    coords[1] = latitude;

    var query = UserDetail.findOne({
        'userName': userName,
        'machineID': machineID
    });

    query.exec(function (err, userLocation) {
        if (err) {
            callback(err, null);
            return;
        }

        if (!userLocation) {
            userLocation = new UserDetail();
            userLocation.userName = userName;
            userLocation.bloodGroup = bloodGroup;
            userLocation.machineID = machineID;
        }

        userLocation.location = [longitude, latitude];
        userLocation.dateUpdated = Date.now();

        userLocation.save(function (saveError, data) {
            if (saveError) {
                callback(saveError, null);
                return;
            }

            callback(null, data);
        });
    });
};

var setInstanceToken = function (userName, machineID, instanceToken, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }
    if (!userName) {
        callback(errorHelper.parameterError('userName'), null);
        return;
    }
    if (!machineID) {
        callback(errorHelper.parameterError('machineID'), null);
        return;
    }
    if (!instanceToken) {
        callback(errorHelper.parameterError('instanceToken'), null);
        return;
    }

    var query = UserDetail.findOne({
        'userName': userName,
        'machineID': machineID
    });

    query.exec(function (err, userDetail) {
        if (err) {
            callback(err, null);
            return;
        }

        if (!userDetail) {
            callback(errorHelper.unauthorizedError('User not signed in on current system.'), null);
            return;
        }

        var instanceTokenObject = {
            clientToken: instanceToken,
            dateUpdated: Date.now()
        };

        userDetail.instanceToken = instanceTokenObject;

        userDetail.save(function (saveError, data) {
            if (saveError) {
                callback(saveError, null);
                return;
            }

            callback(null, data);
        });
    });
};

var sendMessage = function (toUserName, fromUserName, message, messageType, callback) {
    'use strict'
    if (!callback && typeof callback != 'function') {
        return;
    }
    if (!toUserName) {
        callback(errorHelper.parameterError('toUserName'), null);
        return;
    }
    if (!fromUserName) {
        callback(errorHelper.parameterError('fromUserName'), null);
        return;
    }
    if (!message) {
        callback(errorHelper.parameterError('message'), null);
        return;
    }
    if (!messageType) {
        callback(errorHelper.parameterError('messageType'), null);
        return;
    }

    var query = UserDetail.find({
        'userName': toUserName
    });

    query.exec(function (err, userDetails) {
        if (err) {
            callback(err, null);
            return;
        }

        if (userDetails) {
            var instanceTokens = _.map(userDetails, function (userDetail, index) {
                if (userDetail.instanceToken && userDetail.instanceToken.clientToken) {
                    return userDetail.instanceToken.clientToken;
                }
            });

            var gcm = require('node-gcm');

            var gcmMessage = new gcm.Message();

            var data = {
                from: fromUserName,
                body: message,
                bodyType: messageType
            }

            gcmMessage.addData('data', data);

            // Set up the sender with you API key 
            var sender = new gcm.Sender('AIzaSyDns1_NCa-Jb0VFQA3C-hfp6SD7Ap3sCNU');

            // Now the sender can be used to send messages 
            sender.send(gcmMessage, {
                registrationTokens: instanceTokens
            }, function (gcmError, gcmResponse) {
                if (gcmError) {
                    callback(gcmError, null);
                    return;
                }

                if (gcmResponse) {
                    callback(null, gcmResponse);
                }
            });
        }
    });
};


module.exports = {
    createUser: createUser,
    validateAndSignUser: validateAndSignUser,
    hasUser: hasUser,
    signout: signout,
    setLocation: setLocation,
    setInstanceToken: setInstanceToken,
    refreshToken: refreshToken,
    sendMessage: sendMessage
};
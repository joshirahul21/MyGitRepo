var UserDetail = require('../models/UserDetail');
var User = require('../models/User');
var errorHelper = require('../error').errorHelper();
var _ = require('underscore');

var search = function (bloodGroup, longitude, latitude, distance, callback) {
    'use strict'

    if (!callback && typeof callback != 'function') {
        return;
    }

    if (!bloodGroup) {
        callback(errorHelper.parameterError("bloodGroup"), null);
        return;
    }
    if (!longitude) {
        callback(errorHelper.parameterError("longitude"), null);
        return;
    }
    if (!latitude) {
        callback(errorHelper.parameterError("latitude"), null);
        return;
    }
    if (!distance) {
        callback(errorHelper.parameterError("distance"), null);
        return;
    }

    //    var query = UserDetail.find({
    //        'location': {
    //            $near: [longitude, latitude],
    //            $maxDistance: distance
    //        },
    //        'bloodGroup': bloodGroup
    //    });

    //    var convertedDistance = distance / 111.12; // 111.12 is conversion value for KM assuming earth as plane surface. http://stackoverflow.com/questions/7837731/units-to-use-for-maxdistance-and-mongodb

    //    var queryCondition = {
    //        'location': {
    //            $near: [longitude, latitude],
    //            $maxDistance: convertedDistance
    //        },
    //        'bloodGroup': bloodGroup
    //    };

    var dModifier = 3963.2; // dModifier is 3963.2 for miles or 6378.1 for kilometers.

    //    var queryCondition = {
    //        location: {
    //            $geoWithin: {
    //                $centerSphere: [[longitude, latitude], distance / dModifier]
    //            }
    //        },
    //        bloodGroup: bloodGroup
    //    };

    var queryCondition = {
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $minDistance: 0,
                $maxDistance: distance * 1000 //these distance to be passed in meters
            }
        },
        bloodGroup: bloodGroup
    };

    var query = UserDetail.where(queryCondition);

    query.count(function (countError, count) {
        if (countError) {
            callback(countError, null);
            return;
        }
        if (count > 0) {
            var projection = {
                userName: 1,
                location: 1,
                instanceToken: 1,
                _id: 1,
                bloodGroup: 1,
                machineID: 0,
                loginToken: 0,
                dateUpdated: 0
            };

            UserDetail.find(queryCondition, 'userName location instanceToken dateUpdated -_id', function (error, userDetails) {
                if (error) {
                    callback(error, null);
                    return;
                } else {
                    var userNames = _.map(userDetails, function (userDetail) {
                        return userDetail.userName;
                    });
                    User.find({
                            userName: {
                                $in: userNames
                            }
                        },
                        'userName displayName -_id',
                        function (userError, users) {
                            if (userError) {
                                callback(userError, null);
                                return;
                            }

                            var donors = [];

                            userDetails.forEach(function (userDetail) {
                                var displayName = _.findWhere(users, {
                                    'userName': userDetail.userName
                                }).displayName;
                                var item = {
                                    userName: userDetail.userName,
                                    displayName: displayName,
                                    location: userDetail.location,
                                    instanceToken: userDetail.instanceToken,
                                    dateUpdated: userDetail.dateUpdated
                                }
                                donors.push(item);
                            });

                            callback(null, {
                                count: count,
                                items: donors
                            });
                        });
                }
            });

        } else {
            callback(null, {
                count: 0,
                items: []
            });
        }
    });
};

module.exports = {
    search: search
};
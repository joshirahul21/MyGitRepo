console.log('Data Filler Starting.');
console.log('//-------------------------------------------------------------------------------');

// Load Chance
var Chance = require('chance');
var chance = new Chance();

var config = require('config');
var mongoose = require('mongoose');

var userService = require('./dataService/User');

var db = mongoose.connect(config.get('dburl'));

console.log('Database Running.');
console.log('//-------------------------------------------------------------------------------');


//-------------------------------------------------------------------------------

var init = 0;
var last = 5000;
var failCount = 0;

//-------------------------------------------------------------------------------

var userName;
var password;
var displayName;
var bloodGroup;
var machineName;
var machineID;
var longitude;
var latitude;
var instanceToken;
var bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

var signup = function () {

    userService.createUser(userName, password, displayName, bloodGroup, function (err, data) {
        if (err) {
            writeError(err);
        } else {
            login();
        }
    });
};

var login = function () {
    userService.validateAndSignUser(userName, password, machineID, machineName, function (err, data) {
        if (err) {
            writeError(err);
        } else {
            setlocation();

        }
    });
};

var setlocation = function () {
    userService.setLocation(userName, machineID, longitude, latitude, bloodGroup, function (err, data) {
        if (err) {
            writeError(err);
        } else {
            setInstanceToken();
        }
    });
};

var setInstanceToken = function () {
    userService.setInstanceToken(userName, machineID, instanceToken, function (err, data) {
        if (err) {
            writeError(err);
        } else {
            console.log(init + ') ' + displayName + ' created successfully.');
            console.log('//-------------------------------------------------------------------------------');
            init++;
            looper();
        }
    });
}

var looper = function () {
    if (init < last) {

        console.log('Running looper ' + init);
        console.log('//-------------------------------------------------------------------------------');
        userName = chance.email({
            domain: 'datafillermail.com'
        });
        password = 'password';
        displayName = chance.first();
        var bloodGroupIndex = chance.integer({
            min: 0,
            max: 7
        });
        bloodGroup = bloodGroups[bloodGroupIndex];
        machineName = displayName + '-PC';
        machineID = chance.guid();
        instanceToken = chance.android_id()
        longitude = chance.longitude({
            min: -82,
            max: -81
                // bihar  min: 84,
                // bihar  max: 88
        });
        latitude = chance.latitude({
            min: 26,
            max: 27
                // bihar  min: 25,
                // bihar  max: 27
        });
        signup();
    } else {
        console.log('Data Filler task completed.');
        console.log('Data Filler task failed: ' + failCount);
    }
};

var writeError = function (error) {
    console.log(error);

    console.log('//-------------------------------------------------------------------------------');
    failCount++;
    init++;
    looper();
};

looper();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var LoginTokenSchema = new Schema({
//    ,
//    token: {
//        type: String,
//        required: true
//    },
//    tokenKeepAlive: {
//        type: Boolean,
//        required: true,
//        default: false
//    },
//    dateUpdated: {
//        type: Date,
//        required: true,
//        default: Date.now
//    }
//}, {
//    strict: true,
//    _id: false
//});

var InstanceTokenSchema = new Schema({
    clientToken: {
        type: String
    },
    dateUpdated: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    strict: true,
    _id: false
});

var UserDetailSchema = new Schema({
    userName: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    machineID: {
        type: String,
        required: true
    },
    machineName: {
        type: String
    },
    machineType: { //'BW'->Browser Window, 'BM'->Browser Mac, 'BA'->Browser Android, 'AA'->App Android, 'AW'->App Android
        type: String,
        uppercase: true,
        required: true,
        default: 'AA'
    },
    bloodGroup: {
        type: String,
        required: true,
        enum:['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        index: true
    },
    instanceToken: {
        type: InstanceTokenSchema
    },
    location: {
        type: [Number],
        index: '2dsphere',//TODO: Convert it to a '2dsphere' index to get all better support of geolocation.
        default: []
    },
    dateUpdated: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    strict: true
});

UserDetailSchema.index({
    userName: 1,
    machineID: 1
}, {
    unique: true
});



//var LoginToken = mongoose.model('LoginToken', LoginTokenSchema);

var UserDetail = mongoose.model('UserDetail', UserDetailSchema);

module.exports = UserDetail;
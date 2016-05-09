var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    userName: {
        type: String,
        index: true,
        unique: true,
        trim: true,
        lowercase: true,
        required: true //,
            //        dropDups: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    bloodGroup: { //O-, O+, A-, A+, B-, B+, AB-, AB+
        type: String,
        index: true,
        enum:['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'A'
    },
    dateUpdated: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    strict: true
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
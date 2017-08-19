var mongoose = require('mongoose'); // Import Mongoose Package
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, lowercase: true, required: true, unique: true},
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, lowercase: true, unique: true},
    active: { type: Boolean, required: true, default: false },
    temporarytoken: { type: String, required: true },
    resettoken: { type: String, required: false },
    permission: { type: String, required: true, default: 'moderator' },
    date: { type: String, required: true },
    userimage: { type: String, required: true, default: 'false' },
    gallery: { type: String, required: true, default: 'false' }
});

module.exports = mongoose.model('User', UserSchema);
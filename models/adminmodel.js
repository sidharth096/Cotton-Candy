    const mongoose= require('mongoose');

    const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true,
        unique: true
    },

    });

    const admin = mongoose.model('admin', adminSchema);

    module.exports =admin
const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: String
}, {timestamp: true})

const User = mongoose.model('User', userSchema)
module.exports = User
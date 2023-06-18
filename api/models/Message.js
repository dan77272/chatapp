const mongoose = require('mongoose')
const { Schema } = mongoose

const messageSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String
}, {timestamps: true})

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        owner: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
        },
        sentTo: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Message'
        },
        text: {
            type: String
        }
    },
    { timestamps: true }
)
const Message = mongoose.model('Message', messageSchema);
module.exports = { Message }

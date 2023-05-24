const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        Users:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                }
            ],
        Messages:
            [
                {
                    type: [mongoose.Schema.Types.ObjectId],
                    ref: 'Message'
                }
            ]
    }
)
const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = { Conversation }

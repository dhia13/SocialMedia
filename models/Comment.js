const { User } = require('./User')
const { Profile } = require('./Profile')
const mongoose = require('mongoose')
const CommentSchema = new mongoose.Schema(
    {
        ownerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        ownerProfileID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
        },
        text: {
            type: String
        },
        postID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        liked: {
            type: Boolean,
            default: false
        },
        // replies: {
        //     type: [{
        //         owner: {
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: 'Profile'
        //         },
        //         text: String,
        //         likes: {
        //             type: Array,
        //             default: []
        //         },
        //         likeCount: {
        //             type: Number,
        //             default: 0
        //         },
        //         date: {
        //             type: Date,
        //             default: Date.now
        //         }
        //     }],
        // },
        // repliesCount: {
        //     type: Number,
        //     default: 0
        // },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Profile',
            default: []
        },
        likesCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
)
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = { Comment }
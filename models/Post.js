const mongoose = require('mongoose')
const { User } = require('../models/User')
const { Profile } = require('../models/Profile')

const PostSchema = new mongoose.Schema(
    {
        ownerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        ownerProfileID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        },
        caption: {
            type: String
        },
        location: {
            type: String
        },
        hashtag: {
            type: [String],
            default: []
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Profile',
            default: []
        },
        likeCount: {
            type: Number,
            default: 0
        },
        image: {
            type: [String],
            default: []
        },
        comment: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Comment',
            default: []
        },
        commentsCount: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }

)
const Post = mongoose.model('Post', PostSchema);
module.exports = { Post }

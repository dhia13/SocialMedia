const { User } = require('../models/User')
const { Profile } = require('../models/Profile')
const { Post } = require('../models/Post')
const { Comment } = require('../models/Comment')
const commentCtrl = {
    addComment: async (req, res) => {
        try {
            const postID = req.params.id
            const userID = req.user._id
            const userProfile = await Profile.findOne({ 'user': req.user._id }, { _id: 1 })
            const post = await Post.findById(postID)
            const newCommentsCount = post.commentsCount + 1
            const newComment = new Comment({
                ownerID: userID,
                ownerProfileID: userProfile._id,
                text: req.body.text,
                postID: postID
            })
            await newComment.save()
            const CommentID = newComment._id
            await Post.findByIdAndUpdate(postID, {
                $push: {
                    comment: {
                        $each: [CommentID],
                        $position: 0
                    }
                },
            }, { new: true }
            )
            await Post.findByIdAndUpdate(postID, {
                commentsCount: newCommentsCount
            })
            const CommentAdded = await Comment.findById(CommentID).populate({
                path: 'ownerProfileID',
                select: {
                    username: 1,
                    photo: 1
                }
            })
            res.status(201).json({
                success: true, text: 'comment added', data: {
                    comment: CommentAdded,
                }
            })
        } catch (error) {
            res.status(500).json({ msg: error.msg })
        }
    },
    likeCommment: async (req, res) => {
        try {
            const userID = req.user._id
            const commentID = req.params.id
            const comment = await Comment.findById(commentID)
            const userProfile = await Profile.findOne({ user: userID })
            const userProfileID = userProfile._id
            if (comment.likes.includes(userProfileID)) {
                const newLikeCount = comment.likesCount - 1
                await Comment.findByIdAndUpdate(commentID, {
                    $pull: { likes: userProfileID }
                }, { new: true }
                )
                await Comment.findByIdAndUpdate(commentID, {
                    $set: { likesCount: newLikeCount }
                }, { new: true }
                )
                res.status(201).json({ success: true, msg: 'comment Unliked' })
            } else {
                const newLikeCount = comment.likesCount + 1
                await Comment.findByIdAndUpdate(commentID, {
                    $push: { likes: userProfileID }
                }, { new: true }
                )
                await Comment.findByIdAndUpdate(commentID, {
                    $set: { likesCount: newLikeCount }
                }, { new: true }
                )
                res.status(201).json({ success: true, msg: 'comment Liked' })
            }
        } catch (error) {

        }
    },
    deleteComment: async (req, res) => {
        try {

        } catch (error) {

        }
    },
    editComment: async (req, res) => {
        try {

        } catch (error) {

        }
    },
}
module.exports = commentCtrl
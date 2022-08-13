const { User } = require('../models/User')
const { Profile } = require('../models/Profile')
const { Post } = require('../models/Post')
const { Comment } = require('../models/Comment')
const postCtrl = {
    newPost: async (req, res) => {
        try {
            const userProfile = await Profile.findOne({ user: req.user._id })
            const userID = req.user._id
            const newPost = new Post({
                ownerID: userID,
                ownerProfileID: userProfile._id,
                caption: req.body.caption,
                location: req.body.location,
                hashtag: req.body.hashtag,
                image: req.body.image
            })
            await newPost.save()
            const postID = newPost._id
            await Profile.findOneAndUpdate({ user: userID }, {
                $push: { posts: postID },
            },
                { new: true }
            );
            await Profile.findOneAndUpdate({ user: userID }, {
                $push: { feed: postID },
            },
                { new: true }
            );
            const followers = userProfile.followers
            for (let i = 0; i < followers.length; i++) {
                await Profile.findByIdAndUpdate(followers[i], {
                    $push: { feed: postID },
                },
                    { new: true })
            }
            res.status(200).json({ success: true, msg: "post created", post: newPost })
        } catch (err) {
            res.status(500).json({ success: false, msg: err.msg })
        }
    },
    editPost: async (req, res) => {
        try {
            //check if user own the post
            const userID = req.user.id
            const postID = req.params.id
            const post = await Post.findById(postID).select({ ownerID: 1 })
            const postOwner = post.ownerID.toString()
            if (postOwner == userID) {
                await Post.findByIdAndUpdate(postID, {
                    caption: req.body.caption,
                    location: req.body.location,
                    hashtag: req.body.hashtag
                })
                res.status(201).json({ success: true, msg: 'post updated' })
            }
            else {
                res.status(409).json({ success: false, msg: 'not Authorized' })
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.Msg })
        }
    },
    deletePost: async (req, res) => {
        try {
            const userID = req.user._id
            const postID = req.params.id
            const postOwner = await Post.findById(postID, { ownerID: 1 })
            const userProfile = await Profile.findOne({ user: req.user._id })
            const userIDString = userID.toString()
            const postOwnerString = postOwner.ownerID.toString()

            if (userIDString === postOwnerString) {
                //delete post
                await Post.findByIdAndDelete(postID)
                //remove post id from followers feed
                await Profile.findOneAndUpdate({ user: userID }, {
                    $pull: { posts: postID },
                },
                    { new: true }
                );
                const followers = userProfile.followers
                for (let i = 0; i < followers.length; i++) {
                    await Profile.findByIdAndUpdate(followers[i], {
                        $pull: { feed: postID },
                    },
                        { new: true })
                }
                res.status(200).json({ success: true, msg: 'post deleted' })
            } else {
                res.status(409).json({ success: false, msg: 'not authorised' })
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.msg })
        }
    },
    getSinglePost: async (req, res) => {
        try {
            const CommentsNumber = req.query.comments
            const userID = req.user.id
            //*check if post owner account is public 
            //user own the post
            let Relationship = ''
            let Liked = false
            let Access = false
            let Saved = false
            // ProfileOwner Data
            const postID = req.params.id
            const postOwnerProfileID = await Post.findById(postID, { ownerProfileID: 1 })
            const ownerProfile = await Profile.findById(postOwnerProfileID.ownerProfileID,
                { accountType: 1, followers: 1, requests: 1, user: 1 })
            //User Profile Data
            const userProfile = await Profile.findOne({ user: userID },
                { user: 1, username: 1, saved: 1 })
            const UserSaved = userProfile.saved
            const postLike = await Post.findById(postID, { likes: 1 })
            const GetRelationShip = (ownerProfile, userProfile) => {
                // tools
                const checkFollowing = (ownerProfile, userProfile) => {
                    if (ownerProfile.followers.includes(userProfile._id)) {
                        return true
                    }
                    else {
                        return false
                    }
                }
                const checkRequest = (ownerProfile, userProfile) => {
                    if (ownerProfile.requests.includes(userProfile.user)) {
                        return true
                    }
                    else return false
                }
                //owner 
                const GetRelationship = (ownerProfile, userProfile) => {
                    if (ownerProfile._id.equals(userProfile._id)) {
                        return RelationShip = 'MyData'
                    }
                    if (checkFollowing(ownerProfile, userProfile)) {
                        return RelationShip = 'Following'
                    }
                    else {
                        return RelationShip = 'None'
                    }
                }
                GetRelationship(ownerProfile, userProfile)
            }
            GetRelationShip(ownerProfile, userProfile)
            const GetAccess = () => {
                if (RelationShip === 'Following' || ownerProfile.accountType === 'public' || (ownerProfile._id.equals(userProfile._id))) {
                    return Access = true
                }
                else {
                    return Access = false
                }
            }
            GetAccess()
            GetLiked = () => {
                if (postLike.likes.includes(userProfile._id)) {
                    return Liked = true
                }
                else { return Liked = false }
            }
            GetLiked()
            GetSaved = () => {
                if (UserSaved.includes(postID)) {
                    return Saved = true
                } else { return Saved = false }
            }
            GetSaved()
            const postData = await Post.findById(postID)
                .populate('ownerProfileID', { user: 1, photo: 1, username: 1, accountType: 1 })
                .populate({
                    path: 'comment',
                    options: {
                        sort: { createdAt: -1 },
                        select: {
                        },
                        limit: CommentsNumber,
                        populate: {
                            path: 'ownerProfileID',
                            select: {
                                photo: 1,
                                username: 1,
                            }
                        },
                    }
                })
                .populate({
                    path: 'likes',
                    option: {
                        limit: 1,

                    },
                    select: {
                        name: 1,
                        photo: 1
                    }
                })
            const comments = postData.comment
            const GetCommentsLiked = () => {

                for (i = 0; i < comments.length; i++) {
                    if (comments[i].likes.includes(userProfile._id)) {
                        comment = comments[i]
                        comment.liked = true
                    }
                    else {
                        comment = comments[i]
                        comment.liked = false
                    }
                }
            }
            GetCommentsLiked()
            const PostData = {
                Owner: postData.ownerProfileID,
                Info: {
                    Location: postData.location,
                    Caption: postData.caption,
                    Date: postData.createdAt,
                    Hashtags: postData.hashtag,
                    Images: postData.image,
                    PostID: postData._id
                },
                Like: {
                    LikeCount: postData.likeCount,
                    Likes: postData.likes,
                    Liked: Liked,
                    Saved: Saved
                },
                RelationShip: RelationShip,
                Comments: {
                    CommentsCount: postData.commentsCount,
                    Comments: postData.comment
                }

            }
            if (Access) {
                res.status(200).json({ success: true, PostData })
            }
            else {
                res.status(401).json({ success: false, Msg: 'you can not access this post' })
            }
        } catch (error) {
            res.status(401).json({ success: false, Msg: error.Msg })
        }
    },
    getPostLikes: async (req, res) => {
    },
    likePost: async (req, res) => {
        try {
            const userID = req.user._id
            const postID = req.params.id
            const post = await Post.findById(postID)
            const userProfile = await Profile.findOne({ user: userID })
            const userProfileID = userProfile._id
            if (post.likes.includes(userProfileID)) {
                const newLikeCount = post.likeCount - 1
                await Post.findByIdAndUpdate(postID, {
                    $pull: { likes: userProfileID }
                }, { new: true }
                )
                await Post.findByIdAndUpdate(postID, {
                    $set: { likeCount: newLikeCount }
                }, { new: true }
                )
                res.status(201).json({ success: true, msg: 'post Unliked' })
            } else {
                const newLikeCount = post.likeCount + 1
                await Post.findByIdAndUpdate(postID, {
                    $push: { likes: userProfileID }
                }, { new: true }
                )
                await Post.findByIdAndUpdate(postID, {
                    $set: { likeCount: newLikeCount }
                }, { new: true }
                )
                res.status(201).json({ success: true, msg: 'post Liked' })
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.msg })

        }
    },
    savePost: async (req, res) => {
        try {
            const userID = req.user._id
            const postID = req.params.id
            const post = await Post.findById(postID).select({ ownerID: 1 })
            const userProfile = await Profile.findOne({ user: userID }).select({ saved: 1 })
            const userSaved = userProfile.saved
            if (userSaved.includes(postID)) {
                await Profile.findOneAndUpdate({ user: userID }, {
                    $pull: { saved: postID }
                }, { new: true })
                res.status(200).json({ success: true, msg: 'post unSaved' })

            }
            else {
                await Profile.findOneAndUpdate({ user: userID }, {
                    $push: { saved: postID }
                }, { new: true }
                )
                res.status(200).json({ success: true, msg: 'post Saved' })
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.msg })

        }
    },
    getFeed: async (req, res) => {
        try {
            const userID = req.user._id
            const userProfile = await Profile.findOne({ user: userID })
            const Feed1 = userProfile.feed
            const Feed = Feed1.reverse()
            const userProfileID = userProfile._id
            async function getPost(PostID, userProfileID) {
                let Liked = false
                let Saved = false
                const postData = await Post.findById(PostID)
                    .populate('ownerProfileID', { username: 1, photo: 1, user: 1 })
                    .populate({
                        path: 'comment',
                        options: {
                            select: {
                            },
                            limit: 4,
                            populate: {
                                path: 'ownerProfileID',
                                select: {
                                    username: 1,
                                    photo: 1,
                                    user: 1
                                }
                            },
                        }
                    })
                    .populate({
                        path: 'likes',
                        option: {
                            limit: 4,

                        },
                        select: {
                            username: 1,
                            photo: 1,
                            user: 1
                        }
                    })
                const postLike = await Post.findById(PostID, { likes: 1 })
                GetLiked = () => {
                    if (postLike.likes.includes(userProfileID)) {
                        return Liked = true
                    }
                    else { return Liked = false }
                }
                GetLiked()
                GetSaved = () => {
                    if (userProfile.saved.includes(PostID)) {
                        return Saved = true
                    } else { return Saved = false }
                }
                GetSaved()
                return post = {
                    Owner: postData.ownerProfileID,
                    Info: {
                        Location: postData.location,
                        Caption: postData.caption,
                        Date: postData.createdAt,
                        Hashtags: postData.hashtag,
                        Images: postData.image,
                        PostID: postData._id
                    },
                    Like: {
                        LikeCount: postData.likeCount,
                        Likes: postData.likes,
                        Liked: Liked,
                        Saved: Saved
                    },
                    Comments: {
                        CommentsCount: postData.commentsCount,
                        Comments: postData.comment
                    }
                }
            }
            let FeedFilled = []
            for (i = 0; i < Feed.length; i++) {
                const singlePost = await getPost(Feed[i], userProfileID).then(function (post) { return post })
                FeedFilled.push(singlePost)
            }
            res.status(200).json({ Feed: FeedFilled })
        } catch (error) {

        }
    }
}
module.exports = postCtrl
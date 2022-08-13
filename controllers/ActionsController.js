const { User } = require('../models/User')
const { Profile } = require('../models/Profile')

const ActionsCtrl = {
    followUnfollow: async (req, res) => {
        try {
            const subjectID = req.params.id
            const userID = req.user._id
            const userProfile = await Profile.findOne({ user: userID })
            const subjectProfile = await Profile.findOne({ user: subjectID })
            const userProfileID = userProfile._id
            const subjectProfileID = subjectProfile._id
            const ourFollowing = userProfile.following
            const accountType = subjectProfile.accountType
            const subjectRequests = subjectProfile.requests
            const checkFollowing = ourFollowing.includes(subjectProfileID)
            const checkRequest = subjectRequests.includes(userProfileID)
            // in case user account is public
            if (accountType === 'public') {
                // check receiver followers for our id 
                // checking if we already follow the user 
                if (checkFollowing) {
                    // remove following id from following and our id from followers 
                    await Profile.findByIdAndUpdate(subjectProfileID, {
                        $pull: { followers: userProfileID },
                    },
                        { new: true }
                    );
                    await Profile.findByIdAndUpdate(userProfileID, {
                        $pull: { following: subjectProfileID },
                    },
                        { new: true }
                    );
                    const subjectPosts = await Profile.findOne({ user: subjectID }, { posts: 1 })
                    for (let i = 0; i < subjectPosts.posts.length; i++) {
                        await Profile.findByIdAndUpdate(userProfileID, {
                            $pull: { feed: subjectPosts.posts[i] },
                        }, { new: true }
                        )
                    }
                    const userFeed = await Profile.findById(userProfileID, { feed: 1 })
                    const followersFollowing = await Profile.findOne({ user: subjectID }).select({ followers: 1, following: 1 })
                    res.status(200).json({
                        success: true, RelationShip: {
                            type: 'None',
                            followersNumber: followersFollowing.followers.length,
                            followingNumber: followersFollowing.following.length,
                        }
                    })
                }
                // if not following add user to followers and user id to following
                else {
                    await Profile.findByIdAndUpdate(subjectProfileID, {
                        $push: { followers: userProfileID },
                    },
                        { new: true }
                    );
                    await Profile.findByIdAndUpdate(userProfileID, {
                        $push: { following: subjectProfileID },
                    },
                        { new: true }
                    );
                    const subjectPosts = await Profile.findOne({ user: subjectID }, { posts: 1 })
                    for (let i = 0; i < subjectPosts.posts.length; i++) {
                        await Profile.findByIdAndUpdate(userProfileID, {
                            $push: { feed: subjectPosts.posts[i] },
                        }, { new: true }
                        )
                    }
                    const followersFollowing = await Profile.findOne({ user: subjectID }).select({ followers: 1, following: 1 })
                    res.status(200).json({
                        success: true, RelationShip: {
                            type: 'Following',
                            followersNumber: followersFollowing.followers.length,
                            followingNumber: followersFollowing.following.length,
                        }
                    })
                }
            }
            // in case user account is private 
            // we add sender id to requests in receiver profile
            if (accountType === 'private') {
                // check if already following or we already sent request else send request
                // check if already following 
                if (checkFollowing) {
                    // remove following id from following and our id from followers 
                    await Profile.findByIdAndUpdate(subjectProfileID, {
                        $pull: { followers: userProfileID },
                    },
                        { new: true }
                    );
                    await Profile.findByIdAndUpdate(userProfileID, {
                        $pull: { following: subjectProfileID },
                    },
                        { new: true }
                    );
                    const subjectPosts = await Profile.findOne({ user: subjectID }, { posts: 1 })
                    for (let i = 0; i < subjectPosts.posts.length; i++) {
                        await Profile.findByIdAndUpdate(userProfileID, {
                            $pull: { feed: subjectPosts.posts[i] },
                        }, { new: true }
                        )
                    }
                    const followersFollowing = await Profile.findOne({ user: subjectID }).select({ followers: 1, following: 1 })
                    res.status(200).json({
                        success: true, RelationShip: {
                            type: 'None',
                            followersNumber: followersFollowing.followers.length,
                            followingNumber: followersFollowing.following.length,
                        }
                    })
                }
                // if already sent request
                if (checkRequest) {
                    await Profile.findByIdAndUpdate(subjectProfileID, {
                        $pull: { requests: userProfileID },
                    },
                        { new: true }
                    );
                    const followersFollowing = await Profile.findOne({ user: subjectID }).select({ followers: 1, following: 1 })
                    res.status(200).json({
                        success: true, RelationShip: {
                            type: 'None',
                            followersNumber: followersFollowing.followers.length,
                            followingNumber: followersFollowing.following.length,
                        }
                    })
                }
                // add sender id to requests in reciever profile
                if (!checkFollowing && !checkRequest) {
                    await Profile.findByIdAndUpdate(subjectProfileID, {
                        $push: { requests: userProfileID },
                    },
                        { new: true }
                    );
                    const followersFollowing = await Profile.findOne({ user: subjectID }).select({ followers: 1, following: 1 })
                    res.status(200).json({
                        success: true, RelationShip: {
                            type: 'Requested',
                            followersNumber: followersFollowing.followers.length,
                            followingNumber: followersFollowing.following.length,
                        }
                    })
                }

            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.msg })
        }
    },
    acceptRequest: async (req, res) => {
        try {
            const subjectID = req.params.id
            const userID = req.user._id
            const userProfile = await Profile.findOne({ user: userID })
            const subjectProfile = await Profile.findOne({ user: subjectID })
            const userProfileID = userProfile._id
            const subjectProfileID = subjectProfile._id
            const userRequests = userProfile.requests
            const checkRequest = userRequests.includes(subjectProfileID)
            if (checkRequest) {
                await Profile.findByIdAndUpdate(userProfileID, {
                    $pull: { requests: subjectProfileID }
                },
                    { new: true }
                );
                await Profile.findByIdAndUpdate(userProfileID, {
                    $push: { followers: subjectProfileID },
                },
                    { new: true }
                );
                await Profile.findByIdAndUpdate(subjectProfileID, {
                    $push: { following: userProfileID },
                },
                    { new: true }
                );
                const MyPosts = await Profile.findById(userProfileID, { posts: 1 })
                for (let i = 0; i < MyPosts.posts.length; i++) {
                    await Profile.findByIdAndUpdate(subjectProfileID, {
                        $push: { feed: MyPosts.posts[i] },
                    }, { new: true }
                    )
                }
                res.status(200).json({ succes: true, msg: 'Request Accepted' })
            }
            else {
                res.status(403).json({ success: false, msg: 'no request with this id' })
            }
        } catch (error) {
            res.status(500).json({ succes: false, msg: error.msg })
        }
    },
    denyRequest: async (req, res) => {
        try {
            const subjectID = req.params.id
            const userID = req.user._id
            const subjectProfile = await Profile.findOne({ user: subjectID })
            const subjectProfileID = subjectProfile._id
            const userProfile = await Profile.findOne({ user: userID })
            const userRequests = userProfile.requests
            const checkRequest = userRequests.includes(subjectProfileID)
            if (checkRequest) {
                await Profile.findOneAndUpdate({ user: userID }, {
                    $pull: { requests: subjectProfileID }
                },
                    { new: true }
                );
                res.status(200).json({ succes: true, msg: 'Request Denied' })
            }
            else {
                res.status(403).json({ success: false, msg: 'no request with this id' })
            }
        } catch (error) {
            res.status(500).json({ succes: false, msg: error.msg })
        }
    },
    getRequests: async (req, res) => {
        try {
            const userID = req.user._id
            const userProfile = await Profile.findOne({ user: userID }).populate({
                path: 'requests',
                select: {
                    name: 1,
                    photo: 1,
                    user: 1
                }
            })
            const requests = userProfile.requests
            res.status(200).json({ success: true, requests })

        } catch (error) {
            res.status(500).json({ success: false, msg: error.msg })
        }
    },
    getFollowings: async (req, res) => {
        try {
            const userId = req.user._id.toString()
            const subjectId = req.params.id
            const followingsList = await Profile.findOne({ user: subjectId }).select({ following: 1 }).populate({
                path: 'following',
                select: { photo: 1, user: 1, username: 1 }
            })
            res.status(200).json(followingsList)

        } catch (error) {
            res.status(500).json({ succes: false, msg: error.msg })
        }
    },
    getFollowers: async (req, res) => {
        try {
            const userId = req.user._id.toString()
            const subjectId = req.params.id
            const followersList = await Profile.findOne({ user: subjectId }).select({ followers: 1 }).populate({
                path: 'followers',
                select: { photo: 1, user: 1, username: 1 }
            })
            res.status(200).json(followersList)

        } catch (error) {
            res.status(500).json({ succes: false, msg: error.msg })
        }
    },
    searshUsers: async (req, res) => {
        const tag = req.query.tag
        const keyword = req.query.keyword
        if (req.query.keyword) {
            const users = await Profile.find({ username: { '$regex': keyword, '$options': 'i' } }).select({ username: 1, user: 1, photo: 1 })
            res.status(200).json({ success: true, Data: users })
        }
        if (req.query.tag) {
            const Posts = await Posts.find({ hashtag: { '$regex': tag, '$options': 'i' } })
            res.status(200).json({ success: true, Data: Posts })
        }
    }
}
module.exports = ActionsCtrl
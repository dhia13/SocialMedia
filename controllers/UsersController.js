const { User } = require('../models/User')
const { Profile } = require('../models/Profile')
const jwt = require('jsonwebtoken')
const sendMail = require('../utils/SendEmail.js')
const UsersCtrl = {
    getUser: async (req, res) => {
        try {
            const subjectID = req.params.id
            const userID = req.user._id
            const userProfile = await Profile.findOne({ user: userID })
            const ourFollowing = userProfile.following
            const subjectProfile = await Profile.findOne({ user: subjectID }).populate({
                path: 'posts',
                select: { 'image': 1, "likeCount": 1, "commentsCount": 1 }
            }).populate({ path: 'saved', select: { 'image': 1, 'likeCount': 1, 'commentsCount': 1 } })
            const subjectProfileID = subjectProfile._id
            const subjectRequests = subjectProfile.requests
            // first we check if user account is private or public
            // and we check if we follow the user or not 
            const NumberFollowers = subjectProfile.followers.length
            const NumberFollowing = subjectProfile.following.length
            const checkFollowing = ourFollowing.includes(subjectProfileID)
            const checkRequest = subjectRequests.includes(userProfile._id)
            // if asking for user data 
            if (userID.toString() === subjectID) {
                const UserSavedPosts = userProfile.Saved
                userData = {
                    Info: {
                        userId: subjectProfile.user,
                        name: subjectProfile.name,
                        userName: subjectProfile.username,
                        accountType: subjectProfile.accountType,
                        photo: subjectProfile.photo,
                        bio: subjectProfile.bio,
                        website: subjectProfile.website,
                    },
                    Posts: subjectProfile.posts,
                    RelationShip: {
                        type: 'MyData',
                        followingNumber: NumberFollowing,
                        followersNumber: NumberFollowers,
                    },
                    Saved: subjectProfile.saved
                }
                res.status(200).json({ userData, success: true })
            }
            // if account is private
            if (subjectProfile.accountType === 'private') {
                //if following the user
                if (checkFollowing) {
                    //we fil posts 
                    userData = {
                        Info: {
                            userId: subjectProfile.user,
                            name: subjectProfile.name,
                            userName: subjectProfile.username,
                            accountType: subjectProfile.accountType,
                            photo: subjectProfile.photo,
                            bio: subjectProfile.bio,
                            website: subjectProfile.website,
                        },
                        RelationShip: {
                            type: 'Following',
                            followingNumber: NumberFollowing,
                            followersNumber: NumberFollowers,
                        },
                        Posts: subjectProfile.posts
                    }
                    res.status(200).json({ userData, success: true })
                }
                //if not following
                else {
                    if (checkRequest) {
                        userData = {
                            Info: {
                                userId: subjectProfile.user,
                                name: subjectProfile.name,
                                userName: subjectProfile.username,
                                accountType: subjectProfile.accountType,
                                photo: subjectProfile.photo,
                                bio: subjectProfile.bio,
                                website: subjectProfile.website,
                            },
                            Posts: [],
                            RelationShip: {
                                type: 'Requested',
                                followingNumber: NumberFollowing,
                                followersNumber: NumberFollowers,
                            }
                        }
                        res.status(200).json({ userData, success: true })
                    } else {
                        userData = {
                            Info: {
                                userId: subjectProfile.user,
                                name: subjectProfile.name,
                                userName: subjectProfile.username,
                                accountType: subjectProfile.accountType,
                                photo: subjectProfile.photo,
                                bio: subjectProfile.bio,
                                website: subjectProfile.website,
                            },
                            RelationShip: {
                                type: 'None',
                                followingNumber: NumberFollowing,
                                followersNumber: NumberFollowers,
                            },
                            Posts: [],
                        }
                        res.status(200).json({ userData, success: true })
                    }
                }
            }
            // if account is public
            // fill posts
            else if (subjectProfile.accountType === 'public') {
                //if following the user
                if (checkFollowing) {
                    userData = {
                        Info: {
                            userId: subjectProfile.user,
                            name: subjectProfile.name,
                            userName: subjectProfile.username,
                            accountType: subjectProfile.accountType,
                            photo: subjectProfile.photo,
                            bio: subjectProfile.bio,
                            website: subjectProfile.website,
                        },
                        RelationShip: {
                            type: 'Following',
                            followingNumber: NumberFollowing,
                            followersNumber: NumberFollowers,
                        },
                        Posts: subjectProfile.posts,
                    }
                    res.status(200).json({ userData, success: true })
                }
                else {
                    userData = {
                        Info: {
                            userId: subjectProfile.user,
                            name: subjectProfile.name,
                            userName: subjectProfile.username,
                            accountType: subjectProfile.accountType,
                            photo: subjectProfile.photo,
                            bio: subjectProfile.bio,
                            website: subjectProfile.website,
                        },
                        RelationShip: {
                            type: 'None',
                            followingNumber: NumberFollowing,
                            followersNumber: NumberFollowers,
                        },
                        Posts: subjectProfile.posts,
                    }
                    res.status(200).json({ userData, success: true })
                }
            }
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    getUsers: async (req, res) => {
        try {
            res.status(200)
        } catch (error) {
            res.status(404)
        }
    },
    myData: async (req, res) => {
        try {
            const MyData = await Profile.findOne({ user: req.user._id })
            res.status(200).json({ msg: 'User Data Sent', MyData: MyData, success: true })
        } catch (error) {
            return res.status(500).json({ msg: error.message, sucess: false })
        }
    },
    changeProfilePhoto: async (req, res) => {
        const userID = req.user._id
        try {
            if (req.body.photo) {
                const user = await Profile.findOneAndUpdate({ user: userID }, {
                    $set: req.body
                }, { new: true })
                res.status(201).json({ msg: 'Photo Updated', success: true })
            }
        }
        catch (error) {
            return res.status(500).json({ msg: error.message, Success: false })
        }
    },
    updateData: async (req, res) => {
        const userID = req.user._id
        try {
            const user = await Profile.findOneAndUpdate({ user: userID }, {
                $set: req.body
            }, { new: true })
            res.status(201).json({ msg: 'Information Updated', success: true })
        }
        catch (error) {
            return res.status(500).json({ msg: error.message, success: false })
        }
    },
    requestEmailChange: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).select({ name: 1, email: 1 })
            const payload = {
                email: user.email,
                name: user.name
            }
            const changeEmailToken = createChangeEmailToken(payload)
            sendMail(user.email, changeEmailToken, "Change you Email")
            res.json({ msg: 'A confirmation email was sent to you adress.', success: true })
        } catch (error) {
            return res.status(500).json({ msg: error.message, sucess: false })
        }
    },
    changeEmail: async (req, res) => {
        try {
            const user = jwt.verify(req.body.Email_Token, process.env.CHANGE_EMAIL_TOKEN_SECRET)
            const validate = validateEmail(req.body.new_email)
            if (!validate) return res.status(400).json({ msg: 'Email Invalid', success: false })
            const payload = { old_email: user.email, name: user.name, new_email: req.body.new_email }
            const changeEmailToken = createChangeEmailToken(payload)
            sendMail(req.body.new_email, changeEmailToken, 'confirm new Email')
            res.status(202).json({ success: true, msg: 'please confirm new email' })
        } catch (error) {
            return res.status(500).json({ msg: error.message, sucess: false })
        }
    },
    confirmNewEmail: async (req, res) => {
        try {
            const user = jwt.verify(req.body.New_Email_Token, process.env.CHANGE_EMAIL_TOKEN_SECRET)
            await User.findOneAndUpdate({ email: user.old_email }, { email: user.new_email });
            res.status(201).json({ msg: "Email Updated", success: true })
        } catch (error) {
            return res.status(500).json({ msg: error.message, sucess: false })
        }
    },
    deleteAccount: async (req, res) => {
        try {
            await User.findByIdAndRemove(req.user._id)
            res.status(201).json({ msg: "Account Deleted", Success: true })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    }
}
const createChangeEmailToken = (payload) => {
    return jwt.sign(payload, process.env.CHANGE_EMAIL_TOKEN_SECRET, { expiresIn: '15m' })
}
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
module.exports = UsersCtrl

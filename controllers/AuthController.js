const { User } = require('../models/User')
const { Profile } = require('../models/Profile')
const sendMail = require('../utils/SendEmail.js')
const { CLIENT_URL } = process.env
const generateToken = require('../utils/GenrateToken.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const authCtrl = {
    loadingPage: async (req, res) => {
        console.log('hello new world ')
    },
    register: async (req, res) => {
        try {
            const { name, password, email, username, birthday } = req.body
            //   Check if email exists
            const user_email = await User.findOne({ email })
            if (user_email) return res.status(409).json({ msg: 'Email Already Taken', success: false })
            // email Validation
            const validate = validateEmail(email)
            if (!validate) return res.status(409).json({ msg: 'Email Invalid', success: false })
            // Check if name exists
            const user_name = await Profile.findOne({ username })
            if (user_name) return res.status(409).json({ msg: 'Name Already Registered', success: false })
            // check password Strenght
            if (password.length < 6) return res.status(422).json({ msg: 'password too weak', success: false })
            // New User
            const newUser = {
                name, email, password, username, birthday
            }
            const activation_token = createActivationToken(newUser)
            const url = `${CLIENT_URL}/EmailConfirmation/${activation_token}`
            sendMail(email, url, "Verify your email address")
            res.status(202).json({ msg: 'Register Success! Please activate your email to start.', url: activation_token, success: true })
        } catch (err) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    checkEmailAvailability: async (req, res) => {
        try {
            const email = req.body.email
            const user_email = await Profile.findOne({ email })
            if (user_email) return res.status(409).json({ msg: 'Email Already Taken', success: false })
            res.status(200).json({ msg: 'email available', success: true })

        } catch (err) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    checkUsernameAvailability: async (req, res) => {
        try {
            const username = req.body.username
            const user_username = await Profile.findOne({ username: username })
            if (user_username) return res.status(409).json({ msg: 'username already taken', success: false })
            res.status(200).json({ msg: 'username available', success: true })
        } catch (error) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    activateEmail: async (req, res) => {
        try {
            const { activation_token } = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)
            const { email, password, name, username, birthday } = user
            const newUser = new User({
                email, password
            })
            await newUser.save()
            const createdUser = await User.findOne({ email: email })
            const newProfile = new Profile({
                user: createdUser.id,
                username: username,
                email: email,
                birthday: birthday,
                name: name
            })
            await newProfile.save()
            res.json({ msg: "Account has been activated!", success: true })

        } catch (err) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            const userProfile = await Profile.findOne({ user: user._id })
            if (!user) {
                res.status(401).json({ success: false, msg: 'wrong credentials' })
            } else if (!await user.matchPassword(password)) {
                res.status(401).json({ success: false, msg: 'wrong credentials' })
            }
            else if (user && (await user.matchPassword(password))) {
                res.status(200).json({
                    data: {
                        _id: user._id,
                        name: user.name,
                        photo: userProfile.photo,
                        username: userProfile.username
                    },
                    token: generateToken(user._id, user.isAdmin),
                    success: true
                })
            }
        } catch (error) {
            res.status(500).json({ success: false, msg: error.messages })
        }
    },
    requestPasswordChange: async (req, res) => {
        try {
            if (req.body.email) {
                const user = await User.findOne({ email: req.body.email }).select({ email: 1, name: 1 })
                if (!user) {
                    res.json({ msg: 'No account with this email.', success: false })
                }
                if (user) {
                    const payload = {
                        email: user.email,
                        name: user.name
                    }
                    const changePasswordToken = createChangePasswordToken(payload)
                    const url = `${CLIENT_URL}/ChangePassword/${changePasswordToken}`
                    sendMail(req.body.email, url, "Change you Password")
                    res.json({ msg: 'A confirmation email was sent to you adress.', success: true })
                }
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    changePassword: async (req, res) => {
        try {
            const { activation_token } = req.body
            const { password } = req.body
            const user = jwt.verify(activation_token, process.env.CHANGE_PASSWORD_TOKEN_SECRET)
            if (password.length < 6) return res.status(400).json({ msg: 'password too weak', success: false })
            const salt = await bcrypt.genSalt(12)
            hashedPassword = await bcrypt.hash(password, salt)
            await User.findOneAndUpdate({ email: user.email }, { password: hashedPassword });
            res.status(201).json({ msg: "Password Updated", success: true })
        } catch (err) {
            return res.status(500).json({ msg: err.message, success: false })
        }
    },
    checkAuth: async (req, res) => {
        token = req.header
    }
}
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '15m' })
}
const createChangePasswordToken = (payload) => {
    return jwt.sign(payload, process.env.CHANGE_PASSWORD_TOKEN_SECRET, { expiresIn: '15m' })
}

module.exports = authCtrl
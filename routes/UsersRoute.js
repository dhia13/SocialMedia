const router = require('express').Router()
const UsersCtrl = require('../controllers/UsersController')
const { protect, Admin } = require('../utils/Authentication')
//update own data
router.put('/UpdatePhoto', protect, UsersCtrl.changeProfilePhoto)
router.put('/updateData', protect, UsersCtrl.updateData)

//change email
//request Email Change 
router.post('/requestEmailChange', protect, UsersCtrl.requestEmailChange)
//change Email 
router.post('/ChangeEmail', protect, UsersCtrl.changeEmail)
//confirm new Email
router.post('/confirmNewEmail', protect, UsersCtrl.confirmNewEmail)

//delete own account
router.delete('/DeleteAccount', protect, UsersCtrl.deleteAccount)
//see other users data 
router.get('/:id', protect, UsersCtrl.getUser)
router.get('/users', protect, UsersCtrl.getUsers)
module.exports = router
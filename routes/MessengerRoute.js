const router = require('express').Router()
const MessengerCtrl = require('../controllers/MessengerCtrl')
const { protect, Admin } = require('../utils/Authentication')
// // Get Recent Conversations
// router.get('/', protect, MessengerCtrl.recentConversation)
// //Send Message
// router.put('/:id', protect, MessengerCtrl.sendMsg)


module.exports = router
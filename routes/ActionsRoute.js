const router = require('express').Router()
const { protect, Admin } = require('../utils/Authentication')
const ActionCtrl = require('../controllers/ActionsController')
// follow roots
//following or sending follow request
router.post('/followUnfollow/:id', protect, ActionCtrl.followUnfollow)
//accept request 
router.post('/acceptRequest/:id', protect, ActionCtrl.acceptRequest)
//deny request
router.post('/denyRequest/:id', protect, ActionCtrl.denyRequest)
//get requests
router.get('/requests', protect, ActionCtrl.getRequests)
//get followings
router.get('/followings/:id', protect, ActionCtrl.getFollowings)
// get followers
router.get('/followers/:id', protect, ActionCtrl.getFollowers)
//searsh other users
router.get('/users', protect, ActionCtrl.searshUsers)
module.exports = router
const router = require('express').Router()
const PostsCtrl = require('../controllers/PostsController')
const { protect, Admin } = require('../utils/Authentication')
//post CRUD
// add post
router.post('/', protect, PostsCtrl.newPost)
//edit post 
router.put('/edit/:id', protect, PostsCtrl.editPost)
//delete post
router.delete('/:id', protect, PostsCtrl.deletePost)
// get Post 
router.get('/:id', protect, PostsCtrl.getSinglePost)
//Post Actions
//like post 
router.put('/like/:id', protect, PostsCtrl.likePost)
//save post
router.put('/save/:id', protect, PostsCtrl.savePost)
//get Feed 
router.get('/', protect, PostsCtrl.getFeed)
module.exports = router
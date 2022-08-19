const router = require('express').Router()
const CommentCtrl = require('../controllers/CommentsController')
const { protect, Admin } = require('../utils/Authentication')
//Comment on Post
router.post('/:id', protect, CommentCtrl.addComment)
//Like Comment
router.put('/like/:id', protect, CommentCtrl.likeCommment)
// edit comment
router.put('/edit/:id', protect, CommentCtrl.editComment)
// delete Comment
router.delete('/delete/:id', protect, CommentCtrl.deleteComment)

module.exports = router
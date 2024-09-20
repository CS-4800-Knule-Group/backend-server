const express = require('express');
const router = express.Router();
const ShortUniqueId = require('short-unique-id');
const { readComments } = require('../database.js');

const uid = new ShortUniqueId({ length: 10 });

router.get('/', async (req, res) => {
    const result = await readComments();
    res.json(result);
})

// route can change
router.post('/:userId', async (req, res) => {
    const { postId, userId, parentCommentId, content } = req.body
    const commentId = uid.rnd();

    if (!parentCommentId) {
        parentCommentId = null
    }

    const newComment = {
        postId: postId,
        commentId: commentId,
        parentCommentId: parentCommentId,
        userId: userId,
        content: content,
        createdAt: new Date().toISOString(),
    }

    const result = await createComment(newComment);
    console.log('Successfulyl created comment: ', {result});

    res.redirect('/')
});

module.exports = router;
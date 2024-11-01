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

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };

    const newComment = {
        postId: postId,
        commentId: commentId,
        parentCommentId: parentCommentId,
        userId: userId,
        content: content,
        createdAt: new Date().toLocaleString('en-US', options),
    }

    const result = await createComment(newComment);
    console.log('Successfulyl created comment: ', {result});

    res.redirect('/')
});

module.exports = router;
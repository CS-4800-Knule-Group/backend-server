const express = require('express');
const router = express.Router();
const ShortUniqueId = require('short-unique-id');
const { readComments, getComments, createComment } = require('../database.js');
const { authenticateToken } = require('../scripts/middleware.js');

const uid = new ShortUniqueId({ length: 10 });

router.get('/', async (req, res) => {
    const result = await readComments();
    res.json(result);
})

router.get('/post/:postId', async (req, res) => {
    const postId = req.params.postId;
    console.log("postId: ", postId)
    const result = await getComments(postId);
    res.status(200).json(result);
})

// route can change
router.post('/newComment', authenticateToken, async (req, res) => {
    const { postId, userId, content } = req.body
    const commentId = uid.rnd();

    const newComment = {
        postId: postId,
        commentId: commentId,
        userId: userId,
        content: content,
        createdAt: new Date().toISOString(),
    }

    const result = await createComment(newComment);
    console.log('Successfulyl created comment: ', {result});

    res.redirect('/')
});

module.exports = router;
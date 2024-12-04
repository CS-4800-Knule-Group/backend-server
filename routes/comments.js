const express = require('express');
const router = express.Router();
const ShortUniqueId = require('short-unique-id');
const { readComments, getComments, createComment, getPost, addToPost, deleteComment } = require('../database.js');
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
router.post('/newComment', async (req, res) => {
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
    // need to add comment to post's comments array
    const post = await getPost(postId);
    const postUserId = post.userId;
    const response = await addToPost(postUserId, postId, newComment.commentId)

    if (response == 200) {
        console.log('Successfulyl created comment: ', {result});
    }

    // res.redirect(`/post/${postId}`)
    res.status(response).json(result);
});

router.delete('/:postId/:commentId', async(req, res) => {
    const postId = req.params.postId
    const commentId = req.params.commentId

    const response = await deleteComment(postId, commentId)
    res.status(response);
})

module.exports = router;
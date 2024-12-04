const express = require('express');
const router = express.Router();
const { readLikes, createLike, addLikeToPost, deleteLikeFromPost, deleteLike, getPost } = require('../database.js');

router.get('/', async(req, res) => {
    const result = await readLikes();
    res.json(result);
})

// create new like
router.post('/:postId', async (req, res) => {
    const postId = req.params.postId
    const { userId } = req.body
    
    const newLike = {
        targetId: postId,
        userId: userId,
    }
    const result = await createLike(newLike)
    const post = await getPost(postId);
    const postUserId = post.userId;
    const response = await addLikeToPost(postUserId, postId, newLike.userId)

    if (response == 200) {
        console.log('Successfulyl created like: ', {result});
    }
    res.status(response).json(result);
})

router.delete('/:postId/:likerId', async(req, res) => {
    const postId = req.params.postId
    const likerId = req.params.likerId

    const response = await deleteLike(postId, likerId)
    const post = await getPost(postId);
    const postUserId = post.userId;
    const result = await deleteLikeFromPost(postUserId, postId, likerId)
    console.log(response)
    res.status(response);
})

module.exports = router;
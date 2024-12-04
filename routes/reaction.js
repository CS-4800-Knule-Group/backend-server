const express = require('express');
const router = express.Router();
const { readLikes, createLike } = require('../database.js');

router.get('/', async(req, res) => {
    const result = await readLikes();
    res.json(result);
})

// probably move this route to the comments and post route file
// each will have their own post providing either postId or commentId
router.post('/:postId', async (req, res) => {
    const postId = req.params.postId
    const { userId } = req.body
    
    const newLike = {
        postId: postId,
        userId: userId,
    }
    const result = await createLike(newLike)
    console.log('Successfully created like: ', {result})
})

module.exports = router;
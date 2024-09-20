const express = require('express');
const router = express.Router();
const { readLikes } = require('../database.js');

router.get('/', async(req, res) => {
    const result = await readLikes();
    res.json(result);
})

// probably move this route to the comments and post route file
// each will have their own post providing either postId or commentId
router.post('/:targetId', async (req, res) => {
    const targetId = req.params.targetId
    const { userId, like, targetType, targetOwnerId } = req.body
    
    const newLike = {
        targetId: targetId,
        userId: userId,
        like: like,
        targetType: targetType,
        createdAt: new Date().toISOString(),
        targetOwnerId: targetOwnerId
    }
    const reuslt = await createPost(newLike)
    console.log('Successfully created post: ', {result})
    
    res.redirect('/')
})

module.exports = router;
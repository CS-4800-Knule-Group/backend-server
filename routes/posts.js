const express = require('express');
const ShortUniqueId = require('short-unique-id');
const router = express.Router();
const { createPost, readPosts } = require('../database.js');

const uid = new ShortUniqueId({ length: 10 });

router.get('/', async (req, res) => {
    for (let i = 0; i < 10; i++) {
        console.log(uid.rnd())
    }

    for (let i = 0; i < 10; i++) {
        console.log(new Date().toISOString())
    }

    const result = await readPosts();
    res.json(result);
})

router.post('/:userId', async (req, res) => {
    const postId = uid.rnd();
    const userId = req.params.userId;
    // userId can also be passed through body (maybe) depends on front end implementation
    const { content } = req.body;
    
    const newPost = {
        postId: postId,
        author: userId,
        content: content,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
    }
    const reuslt = await createPost(newPost)
    console.log('Successfully created post: ', {result})
    
    res.redirect('/')
})

router.get('/:userId', (req, res) => {

})

// could be potential route for creating comments
router.post('/:postId/comments', (req, res) => {

})

module.exports = router;
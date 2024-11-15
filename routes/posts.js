const express = require('express');
const ShortUniqueId = require('short-unique-id');
const router = express.Router();
const { createPost, readPosts, getUserPosts } = require('../database.js');
const { authenticateToken } = require('../scripts/middleware.js');

const uid = new ShortUniqueId({ length: 10 });

// needs to get deleted eventually
router.get('/', async (req, res) => {
    const result = await readPosts();
    res.status(200).json(result);
})

// router.post('/:userId', authenticateToken, async (req, res) => {
router.post('/:userId', async (req, res) => {
    const postId = uid.rnd();
    const userId = req.params.userId;
    // userId can also be passed through body (maybe) depends on front end implementation
    const { content } = req.body;

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    
    const newPost = {
        postId: postId,
        userId: userId,
        content: content,
        timestamp: new Date().toLocaleString('en-US', options),
        likes: [],
        comments: []
    }
    const result = await createPost(newPost)
    console.log('Successfully created post: ', {result})
    
    res.status(200).redirect('https://main.d1ju3g0cqu0frk.amplifyapp.com/feed')
})

// route to get all posts from a user
// router.get('/:userId', authenticateToken, async (req, res) => {
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId
    const userPosts = await getUserPosts(userId)
    res.status(200).json(userPosts)
})

// could be potential route for creating comments
router.post('/:postId/comments', (req, res) => {
    
})

module.exports = router;
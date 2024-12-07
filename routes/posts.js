const express = require('express');
const ShortUniqueId = require('short-unique-id');
const router = express.Router();
const { createPost, readPosts, getUserPosts, delPost, getPost } = require('../database.js');
const { authenticateToken, multipartSingle } = require('../scripts/middleware.js');
const { createImg, createImgOriginal, getImg, deleteImg } = require('../s3bucket.js');

const uid = new ShortUniqueId({ length: 10 });

// needs to get deleted eventually
router.get('/', async (req, res) => {
    const result = await readPosts();
    for (const post of result){
        //console.log(post)
        if(post.images.length != 0){
            if(post.images[0] != ''){
                post.images[0] = await getImg(post.images[0])
            }
        }
    }
    res.status(200).json(result);
})

router.post('/:userId', multipartSingle('img1'), async (req, res) => {
// router.post('/:userId', async (req, res) => {
    const postId = uid.rnd();
    const userId = req.params.userId;
    // userId can also be passed through body (maybe) depends on front end implementation
    let content = '';
    if(req.body.content){
        content = req.body.content;
    }
    let postImg1 = '';
    console.log(req.file);
    if(req.file){
        postImg1 = await createImgOriginal(req.file);
        console.log(postImg1);
    }

    const newPost = {
        postId: postId,
        userId: userId,
        content: content,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
        images: [postImg1],
    }
    const result = await createPost(newPost)
    console.log('Successfully created post: ', {result})
    
    res.status(200).redirect('https://main.d1ju3g0cqu0frk.amplifyapp.com/feed')
})

// route to get all posts from a user
router.get('/:userId', async (req, res) => {
// router.get('/:userId', async (req, res) => {
    const userId = req.params.userId
    const userPosts = await getUserPosts(userId)
    for (const post of userPosts){
        //console.log(post)
        if(post.images.length != 0){
            if(post.images[0] != ''){
                post.images[0] = await getImg(post.images[0])
            }
        }
    }
    res.status(200).json(userPosts)
})

router.get('/post/:postId', async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await getPost(postId);
        
        if(post.images.length != 0){
            if(post.images[0] != ''){
                post.images[0] = await getImg(post.images[0])
            }
        }
        
        res.status(200).json(post);
    } catch (err) {
        console.log('post does not exist')
    }
})

// could be potential route for creating comments
router.post('/:postId/comments', (req, res) => {
    
})

// BUG kinda: anyone can delete post as long as they have both userId and postId, BUT the onyl 
// userId available to the user should be their own userId so ???
router.delete('/del/:userId/:postId', async (req, res) => {
    const userId = req.params.userId
    const postId = req.params.postId

    const status = await delPost(userId, postId);
    if (status == 200) {
        res.status(200).json({success: "Successfully deleted post"});
    } else {
        res.status(400).json({error: "Error deleting post"});
    }
})

module.exports = router;
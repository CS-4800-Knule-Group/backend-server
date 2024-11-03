// users.js route module
const express = require('express');
const router =  express.Router();
const { v4: uuidv4 } = require('uuid');
const { addUser, readUsers, updateFollowing, updateFollowers } = require('../database.js');
const { hashPassword } = require('../scripts/encrypt.js')
const { authenticateToken, multipartData } = require('../scripts/middleware.js');
const { createImg } = require('../s3bucket.js');


router.get('/', async (req, res) => {
    const result = await readUsers();
    res.json(result)
})

router.post('/newUser', async (req, res) => {
    const { fname, lname, username, email, password } = req.body;

    const userId = uuidv4();
    const fullName = fname + " " + lname
    const hashedPass = await hashPassword(password)

    const newUser = {
        userId: userId,
        fullName: fullName,
        username: username,
        firstName: fname,
        lastName: lname,
        email: email,
        password: hashedPass,
        bio: "",
        friends: [],
        followers: [],
        following: [],
        posts: [],
        createdAt: new Date().toISOString()
    }
    const result = await addUser(newUser)
    console.log('Received form data: ', { result })

    res.redirect('https://main.d1ju3g0cqu0frk.amplifyapp.com/');
})

router.put('/toggleFollowing', async(req, res) =>{
    const {userId, targetId} = req.body;

    const result = await updateFollowing(userId, targetId);
    res.send(result)
})

router.put('/toggleFollowers', async(req, res) =>{
    const {userId, targetId} = req.body;

    const result = await updateFollowers(userId, targetId);
    res.send(result)
})

router.put('/updateProfile', multipartData('image'), async(req, res) => {
    console.log("req.body - userId : ", req.body.userId)
    console.log("req.body - caption : ", req.body.caption)
    console.log("req.file", req.file)
    //createImg(req.file, req.body.userId)
})

module.exports = router;
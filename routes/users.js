// users.js route module
const express = require('express');
const router =  express.Router();
const ShortUniqueId = require('short-unique-id');
const { addUser, readUsers, readUser, updateFollowing, updateFollowers } = require('../database.js');
const { hashPassword } = require('../scripts/encrypt.js')
const { authenticateToken } = require('../scripts/middleware.js');

const uid = new ShortUniqueId({ length: 8 });

router.get('/', async (req, res) => {
    const result = await readUsers();
    res.json(result)
})

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const result = await readUser(userId);
    res.json(result);
})

router.post('/newUser', async (req, res) => {
    const { fname, lname, username, email, password } = req.body;

    const userId = uid.rnd();
    const fullName = fname + " " + lname
    const hashedPass = await hashPassword(password)

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };

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
        createdAt: new Date().toLocaleString('en-US', options)
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

module.exports = router;
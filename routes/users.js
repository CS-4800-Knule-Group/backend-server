// users.js route module
const express = require('express');
const router =  express.Router();
const { v4: uuidv4 } = require('uuid');
const { addUser, readUsers } = require('../database.js');
const { hashPassword } = require('../scripts/encrypt.js')
const { authenticateToken } = require('../scripts/middleware.js');


router.get('/', authenticateToken, async (req, res) => {
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

module.exports = router;
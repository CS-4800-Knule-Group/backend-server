require('dotenv').config()
// auth routes
const express = require('express');
const router =  express.Router();
// const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const { getUserPass, getUserId, addRtoken, getRtoken, deleteRtoken } = require('../database.js');
const { comparePasswords } = require('../scripts/encrypt.js')

// login route
router.post('/login', async (req, res) => {
    // authenticate user
    const { username, password } = req.body
    const storedPass = await getUserPass(username)
    if (await comparePasswords(password, storedPass)) {
        // creation of jwt
        const user = { userId: await getUserId(username), username: username }
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        // store refreshToken in database
        const encrypedToken = encryptToken(refreshToken)
        const rToken = {
            userId: user.userId,
            rToken: encrypedToken
        }
        await addRtoken(rToken)
        res.json({ accessToken: accessToken })
    } else {
        res.sendStatus(400);
    }
})

// logout route
router.delete('/logout', async (req, res) => {
    const userId = req.body.userId
    try {
        await deleteRtoken(userId)
        res.sendStatus(204)
    } catch (err) {
        res.sendStatus(400)
    }
})

// refreshing accessToken
router.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    const decrypedToken = decryptToken(refreshToken)
    jwt.verify(decrypedToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ userId: user.userId, username: user.username })
        res.json({ accessToken: accessToken })
    }) 
})

// route may need to be authenticated ?? (doesnt really matter tbh)
router.get('/getR', async (req, res) => {
    const userId = req.body.userId
    // probably try catch here because this will throw error if user does not have 
    // refresh token associated with them
    const rToken = await getRtoken(userId)
    res.send(rToken)
})

function generateAccessToken(user) {
    // change expire time to around 15-30min
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '6000s' })
}

function encryptToken(token) {
    // const iv = crypto.randomBytes(16); // Generate a random initialization vector (IV)
    // const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    // let encrypted = cipher.update(token);
    // encrypted = Buffer.concat([encrypted, cipher.final()]);
    // return iv.toString('hex') + ':' + encrypted.toString('hex'); // Concatenate IV and the encrypted data
    return token
}

function decryptToken(token) {
    // const [iv, encrypted] = token.split(':');
    // const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
    // let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    // decrypted = Buffer.concat([decrypted, decipher.final()]);
    // return decrypted.toString();
    return token
}

module.exports = router

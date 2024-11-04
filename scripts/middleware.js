const multer = require('multer')
const express = require('express');
const jwt = require('jsonwebtoken');


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}



const storage = multer.memoryStorage()
const upload = multer({ storage: storage})

function multipartSingle(type){
    return upload.single(type);
}

function multipartDouble(){
    return upload.fields([
        {name : "pfp", maxCount:1},
        {name : "banner", maxCount:1},
    ])
}


module.exports = { authenticateToken, multipartSingle, multipartDouble }
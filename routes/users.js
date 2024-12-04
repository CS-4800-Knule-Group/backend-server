// users.js route module
const express = require('express');
const router =  express.Router();
const ShortUniqueId = require('short-unique-id');
const { addUser, readUsers, readUser, updateFollowing, updateFollowers, validUsername, updateUser } = require('../database.js');
const { hashPassword } = require('../scripts/encrypt.js')
const { authenticateToken, multipartSingle, multipartDouble } = require('../scripts/middleware.js');
const { createImg, getImg, deleteImg } = require('../s3bucket.js');
const { read } = require('fs');

const uid = new ShortUniqueId({ length: 8 });

router.get('/', async (req, res) => {
    const result = await readUsers();
    console.log(result);
    for(const user of result){
        if(user.pfp != undefined && user.pfBanner != undefined){
            user.pfp = await getImg(user.pfp)
            user.pfBanner = await getImg(user.pfBanner)
        }else if (user.pfp != undefined && user.pfBanner == undefined){
            console.log(user.pfp)
            user.pfp = await getImg(user.pfp)
        } else if(user.pfp == undefined && user.pfBanner != undefined){
            user.pfBanner = await getImg(user.pfBanner)
        }
    }
    res.status(200).json(result)
})

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const result = await readUser(userId);
    for(const user of result){
        if(user.pfp != undefined && user.pfBanner != undefined){
            user.pfp = await getImg(user.pfp)
            user.pfBanner = await getImg(user.pfBanner)
        }else if (user.pfp != undefined && user.pfBanner == undefined){
            console.log(user.pfp)
            user.pfp = await getImg(user.pfp)
        } else if(user.pfp == undefined && user.pfBanner != undefined){
            user.pfBanner = await getImg(user.pfBanner)
        }
    }

    if (!result) {
        return res.status(404).json({message: "User not found"});
    }
    else {
        res.status(200).json(result);
    }
})

router.post('/newUser', async (req, res) => {
    const { fname, lname, username, email, password } = req.body;
    // check if username is unique
    if (!(await validUsername(username))) {
        return res.status(404).json({error: "Username is already taken"})
    }

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
        pfp: "default.png",
        pfBanner: "default-banner.png",
        bio: "",
        friends: [],
        followers: [],
        following: [],
        createdAt: new Date().toLocaleString('en-US', options)
    }
    const result = await addUser(newUser)
    console.log('Received form data: ', { result })

    res.status(201).redirect('https://main.d1ju3g0cqu0frk.amplifyapp.com/');
})

router.put('/toggleFollowing', async(req, res) =>{
    const {userId, targetId} = req.body;

    const result = await updateFollowing(userId, targetId);
    res.status(200).send(result)
})

router.put('/toggleFollowers', async(req, res) =>{
    const {userId, targetId} = req.body;

    const result = await updateFollowers(userId, targetId);
    res.status(200).send(result)
})

router.put('/updateProfile', multipartDouble(), async(req, res) => {
    console.log("req.body - userId : ", req.body.userId)
    console.log("req.file", req.files.pfp)
    console.log("2nd req.file", req.files.banner)
    console.log("req.body - bio : ", req.body.bio);
    console.log("req.body - fullName : ", req.body.name)

    const userId = req.body.userId
    const bio = req.body.bio
    const name = req.body.name

    const listUsers = await readUsers();
    let userPfp = ''
    let userBanner = '';

    for (const user of listUsers){
        console.log("Testing user: " + user)
        if (user.userId == userId){
            console.log("Testing user.")
            console.log(user);
            if(user.pfp != 'default.png'){
                userPfp = user.pfp;
            }
            if(user.banner != 'default-banner.png'){
                userBanner = user.banner;
            }

            break;
        }
    }

    
    try{
        if(req.files.pfp == undefined && req.files.banner == undefined){   
            await updateUser(userId, bio, name)
        } else if (req.files.banner == undefined){
            const pfpName = await createImg(req.files.pfp[0], 150, 150)
            console.log("Testing result")
            console.log(userPfp)
            if(userPfp != ''){
                deleteImg(userPfp)
            }
            await updateUser(userId, bio, name, pfpName)
        } else if (req.files.pfp == undefined){
            const bannerName = await createImg(req.files.banner[0], 400, 1875)
            if(userBanner != ''){
                deleteImg(userBanner)
            }
            await updateUser(userId, bio, name, "DNE", bannerName)
        }
        else{
            const pfpName = await createImg(req.files.pfp[0], 150, 150)
            const bannerName = await createImg(req.files.banner[0], 400, 1875)
            if(userPfp != ''){
                deleteImg(userPfp)
            }
            if(userBanner != ''){
                deleteImg(userBanner)
            }
            await updateUser(userId, bio, name, pfpName, bannerName)
        }

        res.status(200).send("Sucessful update")
    } catch(err){
        console.log("Update user failed: ", err);
    }
})

module.exports = router;
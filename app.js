const express = require('express');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { addItem, readTable } = require('./database.js');
const { hash } = require('crypto');
const app = express();

const port = 3000;
const saltRounds = 10;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/users', async (req, res) => {
    const result = await readTable()
    res.json(result)
})

app.post('/newUser', async (req, res) => {
    const { fname, lname, username, email, password } = req.body;

    const userId = uuidv4();
    const fullName = fname + " " + lname
    const hashedPass = await hashPassword(password, saltRounds)

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
    const result = await addItem(newUser)
    console.log('Received form data: ', { result })

    res.redirect('/');
})
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });

const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Erorr hashing password: ', error);
    }
};

// TODO: Modify this compare. only needs 1 parameter of plain, hashedPass should be grabbed from db
// const comparePasswords = async (plainPassword, hashedPassword) => {
//     try {
//         const match = await bcrypt.compare(plainPassword, hashedPassword);
//         return match;
//     } catch (error) {
//         console.error('Erorr comparing passwords: ', error);
//     }
// };
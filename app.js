const express = require('express');
const path = require('path');
const { addItem, readTable } = require('./database.js')
const app = express();
const port = 3000;

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

    const fullName = fname + " " + lname

    const newUser = {
        fullName: fullName,
        username: username,
        firstName: fname,
        lastName: lname,
        email: email,
        password: password
    }
    const result = await addItem(newUser)
    console.log('Received form data: ', { result })

    res.send('User data received successfully');
})

app.get('/newItem', async(req, res) => {
    const result = await addItem()
    res.json(result);
})

  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
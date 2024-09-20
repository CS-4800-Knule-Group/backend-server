const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const users = require('./routes/users.js')
const posts = require('./routes/posts.js')
const comments = require('./routes/comments.js')
const likes = require('./routes/reaction.js');

const port = 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/users', users);
app.use('/posts', posts);
app.use('/comments', comments);
app.use('/likes', likes);
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });

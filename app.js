const express = require('express');
const cors = require('cors');

const app = express();

// express router
const auth = require('./routes/auth.js');
const users = require('./routes/users.js');
const posts = require('./routes/posts.js');
const comments = require('./routes/comments.js');
const likes = require('./routes/reaction.js');
// const messages = require('./routes/message.js')

const port = 3000;

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/auth', auth);
app.use('/users', users);
app.use('/posts', posts);
app.use('/comments', comments);
app.use('/likes', likes);
// app.use('/messages', messages);
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });

module.exports = app;
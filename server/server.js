const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('../models/todo');
const {User} = require('../models/user')

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(bodyParser.json());

// Add todo
app.post('/todos', (req, res) => {
  let todo = new Todo({text: req.body.text});

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Add User
app.post('/user', (req, res) => {
  let user = new User({name: req.body.name, email: req.body.email});
  console.log(req.body);
  user.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

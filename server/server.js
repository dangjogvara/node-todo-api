const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('../models/todo');
const {User} = require('../models/user')

const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(bodyParser.json());

// add todo
app.post('/todos', (req, res) => {
  let todo = new Todo({text: req.body.text});

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// get todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// get todo by ID
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// add User
app.post('/user', (req, res) => {
  let user = new User({name: req.body.name, email: req.body.email});
  console.log(req.body);
  user.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

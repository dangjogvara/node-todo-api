const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(bodyParser.json());

// add todo
app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then(
    (doc) => {
      res.send(doc);
    },
    (e) => {
      res.status(400).send(e);
    }
  );
});

// get todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id }).then(
    (todos) => {
      res.send({ todos });
    },
    (e) => {
      res.status(400).send(e);
    }
  );
});

// get todo by ID
app.get('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
    .then((todo) => {
      if (!todo) {
        res.status(404).send();
      }
      res.send({ todo });
    })
    .catch((e) => {
      res.status(400).send();
    });
});

// delete todo
app.delete('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
    .then((todo) => {
      if (!todo) {
        res.status(404).send();
      }
      res.send(todo);
    })
    .catch((e) => {
      res.status(400).send();
    });
});

// update todo
app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    {
      $set: body
    },
    { new: true }
  )
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch((e) => {
      res.status(400).send();
    });
});

// add user
app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.header('x-auth', token).send(user);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

// Get user profile
app.get('/users/profile', authenticate, (req, res) => {
  res.send(req.user);
});

// Login
app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
    })
    .catch((e) => {
      res.status(400).send();
    });
});

// Logout
app.delete('/users/profile/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

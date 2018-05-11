// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server')
  }
  console.log('Connected to MongoDB server');

  // DeleteMany
  db.collection('Todos').deleteMany()

  // DeleteInsertOne

  // FindOneAndDelete

  client.close();
});

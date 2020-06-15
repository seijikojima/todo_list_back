const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path');
// const moment = require("moment")

const port = 5005
const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static("/public/"));

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID;

const connectOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const dbName = "todo" 
const colName = "todo"
const url = "mongodb://" + "127.0.0.1/" + dbName

// get todo lists
app.get('/data', function (req, res) {
    console.log("get all data")
    MongoClient.connect(url, connectOption, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection(colName).find().sort().toArray(function(err, result) {
          // result = result.slice(0,100)
          if (err) throw err;
          res.send(result)
          console.log(result.length)
          db.close()
        })
    })
});

// new item
app.post('/new_todo_item', function (req, res) {
  console.log(req.body)
  MongoClient.connect(url, connectOption, function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    var query = req.body;
    console.log(query)
    dbo.collection(colName).insertOne(query, function(err, result) {
      if (err) throw err;
      console.log("1 document inserted");
      res.send(result.value)
      db.close();
    });
  }); 
});

// done todo list
app.post('/done_todo_item', function (req, res) {
    console.log(req.body)
    MongoClient.connect(url, connectOption, function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    var query = { _id: ObjectID(req.body._id)};
    // req.body.Last_update = moment().format("YYYY/MM/DD HH:mm:ss");
    dbo.collection(colName)
    .findOneAndUpdate(query, { $set: { done : true } }, {returnOriginal: false}, function(err, result) {
      if (err) throw err;
      db.close();
      res.send(result.value)
    });
  }); 
});

// delete article
app.post('/delete_todo_item', function (req, res) {
  console.log("here is delete article" ,req.body._id)
  MongoClient.connect(url, connectOption, function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    // var query = { _id: ObjectID(req.query._id)};
    // var query = { _id: req.query._id};
    var query = { _id: ObjectID(req.body._id)};
    delete req.body._id;
    delete req.body.loading;
    dbo.collection(colName).deleteOne(query, function(err, obj) {
      if (err) throw err;
      // console.log("1 document deleted");
      console.log(obj.result.n + " document(s) deleted");
      db.close();
    });
  }); 
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
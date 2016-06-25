'use strict';
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');

module.exports = function(app){
  app.use(init);
  app.use(connectToDatabase);
  app.use(bodyParser.json());
}

function init(req, res, next) {
  req.modules = {};
  next();
}

function connectToDatabase(req, res, next) {
  MongoClient.connect("mongodb://localhost:27017/chores", function(err, db){
    console.log('connected to db')
    req.modules.db = db
    next();
  });
}

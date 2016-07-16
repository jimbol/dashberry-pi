'use strict';

let ObjectId = require('mongodb').ObjectId;
let validate = require('./validate');

function get(req, res) {
  let db = req.modules.db;
  let collection = db.collection('people');

  collection.find().toArray(function(err, items) {
    res.send(items);
  });
}

function post(req, res){
  let validObj = validate.allPresent(req.body);

  if (validObj) {
    return res.status(403).send('Forbidden');
  }

  let db = req.modules.db;
  let collection = db.collection('people');

  collection.insert(req.body, {w:1}, function(err, result) {
    res.send(result);
  });
}

function put(req, res){
  let validObj = validate.allPresent(req.body);

  if (!validObj) {
    return res.status(403).send('Forbidden');
  }

  let db = req.modules.db;
  let collection = db.collection('people');

  collection.updateOne({
    _id: new ObjectId(req.body._id)
  }, {
    $set: validObj
  }, function(err, result) {
    res.send(result);
  });
}

module.exports = {
  get: get,
  post: post,
  put: put,
};

'use strict';

let ObjectId = require('mongodb').ObjectId;

function get(req, res, collectionName, validate) {
  let db = req.modules.db;
  let collection = db.collection(collectionName);

  collection.find().toArray(function(err, items) {
    res.send(items);
  });
}

function post(req, res, collectionName, validate){
  let validObj = validate.allPresent(req.body);

  if (!validObj) {
    return res.status(403).send('Forbidden');
  }

  let db = req.modules.db;
  let collection = db.collection(collectionName);

  collection.insert(req.body, {w:1}, function(err, records) {
    if(err) {
      return res.status(500).send('There was an error adding the document.');
    }
    res.send(records.ops[0]);
  });
}

function put(req, res, collectionName, validate){
  let validObj = validate.allPresent(req.body);

  if (!validObj) {
    return res.status(403).send('Forbidden');
  }

  let db = req.modules.db;
  let collection = db.collection(collectionName);

  collection.updateOne({
    _id: new ObjectId(req.body._id)
  }, {
    $set: validObj
  }, function(err, result) {
    res.send(result);
  });
}

module.exports = (collectionName, validate) => {
  return {
    get: (req, res) => get(req, res, collectionName, validate),
    post: (req, res) => post(req, res, collectionName, validate),
    put: (req, res) => put(req, res, collectionName, validate),
  };
};

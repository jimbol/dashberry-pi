'use strict';

let validate = require('./validate')

function get(req, res) {
  let db = req.modules.db;
  let collection = db.collection('chores');

  collection.find().toArray(function(err, items) {
    res.send(items);
  });
}

function post(req, res){
  let db = req.modules.db;
  let collection = db.collection('chores');

  if (!validate(req.body, )) {
    return res.status(403).send('Forbidden');
  }

  collection.insert(req.body, {w:1}, function(err, result) {
    res.send(result);
  });
}

module.exports = {
  get: get,
  post: post,
};

'use strict';
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
var verifier = require('google-id-token-verifier');

let CLIENT_ID = '235801848933-d5kekdcel3sm7qe722c7j3uo1kc3sq5r.apps.googleusercontent.com';

module.exports = function(app){
  app.use(init);
  app.use(connectToDatabase);
  app.use(bodyParser.json());

  app.use('/chores', verifyUser);

}

function init(req, res, next) {
  req.modules = {};
  next();
}

function verifyUser(req, res, next) {
  let idToken = req.query.idToken || req.body.idToken
  req.body = req.body.chore

  // TODO
  // TODO Store token and user data as key value pairs somehow
  // TODO

  verifier.verify(idToken, CLIENT_ID, function (err, tokenInfo) {
    if (err) {
      console.log('[USER-NOT-VERIFIED]', err);
    } else if (!err) {
      req.user = tokenInfo
      console.log('[USER-VERIFIED]');
    }

    next();
  });
}

function connectToDatabase(req, res, next) {
  MongoClient.connect("mongodb://localhost:27017/chores", function(err, db){
    console.log('[CONNECTED-TO-DB]')
    req.modules.db = db
    next();
  });
}

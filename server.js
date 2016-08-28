'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

require('./middleware')(app);
let validateChores = require('./store/chore/validate');
let validateUsers = require('./store/user/validate');
let createStore = require('./store');


// Set up http
http.listen(3000, function(){
  console.log('Listening on port 3000');
});

// ROUTES
app.get('/', function (req, res) {
  res.sendfile('index.html');
});

let choreStore = createStore('chores', validateChores);
app.get('/chores', choreStore.get);
app.post('/chores', choreStore.post);
app.put('/chores', choreStore.put);

let userStore = createStore('users', validateUsers);

app.get('/users', (req, res) => {
  console.log('[GET-USER]');
  req.query.sub = req.user.sub
  userStore.get(req, res)
});

app.post('/users', (req, res) => {
  console.log('[CREATE-USER]');
  let authUser = req.user

  let user = {
    sub: authUser.sub,
    email: authUser.email,
    name: authUser.name,
    picture: authUser.picture,
    given_name: authUser.given_name,
    family_name: authUser.family_name
  };

  console.log(user)
  req.body = user

  userStore.post(req, res)
});
app.put('/users', userStore.put);


app.get('/assets/*', function (req, res) {
  res.sendfile('client/' + req.params[0]);
});

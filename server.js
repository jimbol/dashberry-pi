'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

require('./middleware')(app);
let validateChores = require('./store/chore/validate');
let validatePeople = require('./store/person/validate');
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




// TODO: START HERE
// people are not being validated properly
// investigate why

let personStore = createStore('people', validatePeople);

app.get('/people', personStore.get);
app.post('/people', personStore.post);
app.put('/people', personStore.put);

app.get('/assets/*', function (req, res) {
  res.sendfile('client/' + req.params[0]);
});

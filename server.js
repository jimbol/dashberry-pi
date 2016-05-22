'use strict';

let express = require('express');
let app = express();

let Store = require('./store');
let store = new Store();

// Set up http
let http = require('http').Server(app);
let io = require('socket.io')(http);

http.listen(3000, function(){
  console.log('Listening on port 3000');
});


app.get('/', function (req, res) {
  res.sendfile('index.html');
});

io.on('connection', function (socket) {

  socket.emit('chores', {
    chores: store.get('chores'),
    people: store.get('people')
  });

  socket.on('chores:set', function (data) {
    let updatedData = updateData(data);
    if(!updateData) { return; }

    let chores = updatedData.chores;
    let people = updatedData.people;

    store.set('chores', chores);
    store.set('people', people);

    io.emit('chores', {chores, people});

    console.log('Emit chores event');
  });
});

function updateData(data){

  let chores = data.chores;
  let staleChores = store.get('chores');
  let people = store.get('people');


  // clear people's chores
  for(let j = 0; j < people.length; j++){
    let person = people[j];
    person.chores = [];
  }


  // validate new data from client
  for(let i = 0; i < chores.length; i++) {

    let chore = chores[i];
    let staleChore = staleChores[i];

    people[chore.person].chores.push(i);

    if(chore.label !== staleChores[i].label) {
      console.log('[CHORE-SET-ERROR]', 'Chore order has changed');
      return;
    }

    if(chore.person === staleChores[i].person) { continue; }

    if(chore.person >= people.length){
      console.log('[CHORE-SET-ERROR]', '`person` value does not correspond with a person');
      return;
    }

  }


  return {chores, people};
}

app.get('/assets/*', function (req, res) {
  res.sendfile('client/' + req.params[0]);
});

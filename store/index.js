'use strict';

let jsonfile = require('jsonfile');
let _ = require('underscore');

let file = __dirname + '/data.json';
let store = undefined;

module.exports = class Store {
  constructor(){
    if(!store) {
      fetch();
    }
  }

  get(key) {
    return _.clone(store[key]);
  }

  set(key, value) {
    store[key] = value;
    persist();

    return store[key];
  }
};

function fetch(){
  jsonfile.readFile(file, function(err, obj) {
    if(err){
      throw new Error(err);
    }

    store = obj;
  });

};

function persist(){
  jsonfile.writeFile(file, store, function(err) {
    if(err){
      console.log('[DATA-PERSISTED-FAILED]')
      console.log(err)
      throw new Error(err);
    }
    console.log('[DATA-PERSISTED]')
  });
}

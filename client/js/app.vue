<style>
  .list {
    list-style-type: none;
    padding: 15px;
    margin: 0 5px 15px 0;
    background-color: #efefef;
    font-family: Helvetica, Arial;
    display: inline-block;
    width: 200px;
    vertical-align: top;
  }
  .list li {
    padding: 5px;
  }
  .list li.chore:hover {
    cursor: pointer;
    background-color: #fff;
  }
  .title {
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .to-do-container {
    min-height: 100px;
  }
</style>

<template>
  <div class="to-do-container">
    <ul v-for="person in people" class="list">
      <li class="title">{{person.name}}</li>
      <li class="chore" v-for="chore in person.chores"
        v-on:click="toggle(chores[chore])">
          {{chores[chore].label}}
      </li>
    </ul>
    <div>{{msg}}</div>
  </div>
</template>

<script>
  export default {
    methods: {
      toggle: function(chore){

        if(chore.person < this.people.length - 1) {
          chore.person++;
        } else {
          chore.person = 0;
        }

        var output = {};
        output.chores = this.chores;
        output.people = this.people;

        socket.emit('chores:set', output);
      }
    },

    ready: function () {
      var self = this;

      socket.on('chores', function (data) {
        console.log(data)
        self.chores = data.chores;
        self.people = data.people;
      });
    },

    data: function(done){
      return {
        chores: [],
        people: []
      }
    }
  }
</script>

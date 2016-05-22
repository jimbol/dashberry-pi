var App = require('./app.vue')
window.Vue = require('vue');
window.socket = io.connect();

new Vue({
  el: 'body',
  components: {
    app: App
  }
});

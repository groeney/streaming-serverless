import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

window.headers = { 'Content-Type': 'application/json; charset=utf-8' };

new Vue({
  el: '#app',
  render: h => h(App),
});

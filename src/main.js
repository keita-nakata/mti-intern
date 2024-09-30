import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css';
// import Vue from 'vue';
import SuiVue from 'semantic-ui-vue';
import 'semantic-ui-css/semantic.min.css';

// Vue.use(SuiVue);
const app = createApp(App)
app.use(router)
app.mount('#app')

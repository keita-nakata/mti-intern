import {createRouter, createWebHashHistory} from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Settings from '../views/Settings.vue';
import User from '../views/User.vue';
import Toppage from '../views/Toppage.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: {
        title: 'Settings'
      }
    },
    {
      path: '/user',
      name: 'User',
      component: User,
      meta: {
        title: 'User'
      }
    },
    {
      path: '/toppage',
      name: 'Toppage',
      component: Toppage,
      meta: {
        title: 'Toppage'
      }
    },
  ]
})

const DEFAULT_TITLE = 'TITLE';

router.afterEach((to) => {
  document.title = to.meta.title ?? DEFAULT_TITLE
})

export default router

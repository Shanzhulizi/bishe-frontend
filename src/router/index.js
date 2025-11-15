import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Auth from '../views/Auth.vue'

import Profile from '../views/Profile.vue'
import CharacterList from '../views/CharacterList.vue'
import SceneList from '../views/SceneList.vue'
import CreateCharacter from '../views/CreateCharacter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Auth',
    component: Auth
  },
   {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/characters',
    name: 'CharacterList',
    component: CharacterList,
    meta: { requiresAuth: true }
  },
  {
    path: '/scenes',
    name: 'SceneList',
    component: SceneList,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-character',
    name: 'CreateCharacter',
    component: CreateCharacter,
    meta: { requiresAuth: true }
  },
  {
  path: '/chat/:characterId?',
  name: 'Chat',
  component: () => import('../views/Chat.vue'),
  meta: { requiresAuth: true }
},
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
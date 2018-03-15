import Vue from 'vue'
import Router from 'vue-router'
import Game from '@/components/Game'
import Lobby from '@/components/Lobby'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Lobby',
      component: Lobby
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    }
  ]
})

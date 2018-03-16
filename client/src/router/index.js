import Vue from 'vue'
import Router from 'vue-router'
import Game from '@/components/Game'
import Lobby from '@/components/Lobby'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: Lobby
    },
    {
      path: '/game/:name',
      name: 'game',
      component: Game
    }
  ]
})

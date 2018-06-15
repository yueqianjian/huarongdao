import Vue from 'vue'
import Router from 'vue-router'
import HuaRongDao from '../components/huaRongDao'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: HuaRongDao
    }
  ]
})

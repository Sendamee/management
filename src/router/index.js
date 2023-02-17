import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/views/Login'
import HomePage from '@/views/Home'


Vue.use(VueRouter)

const routes = [
   //路由重定向
  {
    
    path:'*',
    redirect:'/login'
  },
  {
    path:'/login',
    component:LoginPage
  },
  {
    path:'/home',
    component:HomePage
  }
  
]

const router = new VueRouter({
  routes
})

//挂载全局路由导航守卫
router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next()  //如果访问的是登陆页面，就放行
  //获取token
  const tokenStr = window.sessionStorage.getItem('token') 
  if(!tokenStr) return next('/login')//如果没有token，就不让进入
  next()
})
export default router

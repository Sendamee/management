import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/views/Login'
import HomePage from '@/views/Home'
import UsersPage from '@/views/Home/Users'
import WelcomePage from '@/views/Home/Welcome'
import RolesList from '@/views/Home/Role'
import PowerList from '@/views/Home/Power'
import GoodsCategorise from '@/views/Home/Goods/Cate'
import GoodsParams from '@/views/Home/Goods/Params'
import GoodsList from '@/views/Home/Goods/List'
import AddPage from '@/views/Home/Goods/Add'
import OrderPage from '@/views/Home/Order'

Vue.use(VueRouter)

const routes = [
   //路由重定向
  {
    
    path:'/',
    redirect:'/login',
  },
  {
    path:'/login',
    component:LoginPage
  },
  {
    path:'/home',
    component:HomePage,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:WelcomePage,
      },
      {
        path:'/users',
        component:UsersPage,
      },
      {
        path:'/rights',
        component:PowerList,
      },
      {
        path:'/roles',
        component:RolesList,
      },
      {
        path:'/categories',
        component:GoodsCategorise
      },
      {
        path:'/params',
        component:GoodsParams
      },
      {
        path:'/goods',
        component:GoodsList,
      },
      {
        path:'/goods/add',
        component:AddPage
      },
      {
        path:'/orders',
        component:OrderPage
      }
    ]
  },
 
  
]

const router = new VueRouter({
  routes
})

//挂载全局路由导航守卫
router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next()  //如果访问的是登陆页面，就放行
  //获取token
  const tokenStr = window.sessionStorage.getItem('token') 
  if(!tokenStr)return next('/login')//如果没有token，就不让进入
  next()
})
export default router

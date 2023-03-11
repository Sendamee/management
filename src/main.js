import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'
//引入全局样式表
import '@/assets/css/global.css'
//导入字体图标
import '@/assets/fonts/iconfont.css'  //.css不能忘掉
// 引入树形表格组件
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' 
import 'quill/dist/quill.snow.css' 
import 'quill/dist/quill.bubble.css' 

Vue.config.productionTip = false

import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL ='https://lianghj.top:8888/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //最后必须返回token
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table',TreeTable)
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

//注册全局过滤器
//格式化时间的全局过滤器
Vue.filter('dateFormat',function(originVal){
 const dt = new Date(originVal)

 const y =dt.getFullYear()
 //month是从0开始的
 const m =(dt.getMonth()+1+'').padStart(2,'0')
 const d =(dt.getDate()+'').padStart(2,'0')
 const hh =(dt.getHours()+'').padStart(2,'0')
 const mm =(dt.getMinutes()+'').padStart(2,'0')
 const ss =(dt.getSeconds()+'').padStart(2,'0')

 return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
 
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

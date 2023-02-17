import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'
//引入全局样式表
import '@/assets/css/global.css'
//导入字体图标
import '@/assets/fonts/iconfont.css'  //.css不能忘掉

Vue.config.productionTip = false

import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL ='https://lianghj.top:8888/api/private/v1/'
Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
